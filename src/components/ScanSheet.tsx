import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { CameraOff, ImageUp, Keyboard, X } from 'lucide-react'

let seq = 0

type Status = 'starting' | 'scanning' | 'reading-file' | 'error'

function cameraErrorMessage(err: unknown): string {
  if (typeof window !== 'undefined' && !window.isSecureContext)
    return 'Camera chỉ chạy trên trang HTTPS. Hãy tải ảnh QR lên hoặc nhập tay.'
  const text = String((err as { name?: string })?.name ?? '') + ' ' + String(err)
  if (/NotAllowed|Permission|denied/i.test(text)) return 'Bạn đã chặn quyền dùng camera. Cho phép camera trong cài đặt trình duyệt, hoặc tải ảnh QR lên.'
  if (/NotFound|no camera|Requested device not found|OverconstrainedError/i.test(text)) return 'Không tìm thấy camera trên thiết bị này. Hãy tải ảnh QR lên hoặc nhập tay.'
  if (/NotReadable|in use|TrackStart/i.test(text)) return 'Camera đang được ứng dụng khác dùng. Đóng ứng dụng đó rồi thử lại.'
  return 'Không mở được camera. Hãy tải ảnh QR lên hoặc nhập tay.'
}

async function stopSafe(scanner: Html5Qrcode | null): Promise<void> {
  if (!scanner) return
  try {
    if (scanner.isScanning) await scanner.stop()
  } catch {
    /* đã dừng */
  }
  try {
    scanner.clear()
  } catch {
    /* bỏ qua */
  }
}

/**
 * Sheet quét QR toàn màn hình (Html5Qrcode, UI tự vẽ):
 * camera sau + "Tải ảnh QR lên" (scanFile). Luôn tắt camera khi đóng/unmount.
 */
export function ScanSheet({
  open,
  title,
  hint,
  onResult,
  onClose,
  onManual,
}: {
  open: boolean
  title: string
  hint: string
  onResult: (text: string) => void
  onClose: () => void
  onManual: () => void
}) {
  if (!open) return null
  return createPortal(<ScanBody title={title} hint={hint} onResult={onResult} onClose={onClose} onManual={onManual} />, document.body)
}

function ScanBody({
  title,
  hint,
  onResult,
  onClose,
  onManual,
}: {
  title: string
  hint: string
  onResult: (text: string) => void
  onClose: () => void
  onManual: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const startRef = useRef<Promise<unknown>>(Promise.resolve())
  const doneRef = useRef(false)
  const fileModeRef = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('starting')
  const [error, setError] = useState<string | null>(null)

  // Giữ callback mới nhất trong ref để effect camera chỉ chạy 1 lần (không khởi động lại mỗi lần render).
  const onResultRef = useRef(onResult)
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const finish = useCallback((text: string) => {
    if (doneRef.current) return
    doneRef.current = true
    void stopSafe(scannerRef.current)
    onResultRef.current(text.trim())
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const el = document.createElement('div')
    el.id = `qr-reader-${++seq}`
    el.className = 'qr-reader'
    host.appendChild(el)
    const scanner = new Html5Qrcode(el.id, { verbose: false, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] })
    scannerRef.current = scanner
    let alive = true

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setStatus('error')
      setError(cameraErrorMessage(new Error('insecure')))
    } else {
      startRef.current = scanner
        .start({ facingMode: 'environment' }, { fps: 10, disableFlip: false }, (text) => finish(text), () => {})
        .then(() => {
          // Camera mở muộn sau khi người dùng đã chọn tải ảnh → tắt ngay.
          if (fileModeRef.current || doneRef.current) return stopSafe(scanner)
          if (alive) setStatus('scanning')
        })
        .catch((err: unknown) => {
          if (!alive) return
          setStatus('error')
          setError(cameraErrorMessage(err))
        })
    }

    return () => {
      alive = false
      document.body.style.overflow = prevOverflow
      void startRef.current.finally(async () => {
        await stopSafe(scanner)
        el.remove()
      })
    }
  }, [finish])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    const scanner = scannerRef.current
    if (!file || !scanner) return
    fileModeRef.current = true
    setStatus('reading-file')
    setError(null)
    try {
      // Chờ camera khởi động xong (tối đa 1,5s — tránh treo khi hộp xin quyền còn mở).
      await Promise.race([startRef.current.catch(() => {}), new Promise((r) => window.setTimeout(r, 1500))])
      // Camera đang chạy thì phải dừng TRƯỚC khi quét ảnh.
      if (scanner.isScanning) await scanner.stop()
      const text = await scanner.scanFile(file, false)
      finish(text)
    } catch {
      setStatus('error')
      setError('Không đọc được mã QR trong ảnh. Chọn ảnh rõ, chứa trọn mã QR.')
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex flex-col bg-[#111111] text-white">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 pt-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <h2 className="text-lg font-bold tracking-[-0.02em]">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Đóng" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-[10px]">
          <X size={20} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className="relative mx-auto mt-3 w-full max-w-[480px] flex-1 overflow-hidden">
        <div ref={hostRef} className="absolute inset-0 [&_.qr-reader]:h-full [&_.qr-reader]:w-full [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover" />
        {/* Khung ngắm tự vẽ */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square w-[68%] max-w-[300px]">
            {(['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'] as const).map((c) => (
              <span key={c} className={`absolute h-8 w-8 rounded-[4px] border-white ${c}`} />
            ))}
          </div>
        </div>
        {status === 'starting' && <p className="absolute inset-x-0 top-1/2 text-center text-sm text-white/80">Đang mở camera…</p>}
        {status === 'reading-file' && <p className="absolute inset-x-0 top-1/2 text-center text-sm text-white/80">Đang đọc ảnh…</p>}
        {status === 'error' && error && (
          <div role="alert" className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-[14px] bg-white p-4 text-ink">
            <p className="flex items-start gap-2 text-sm font-medium">
              <CameraOff size={20} strokeWidth={1.75} className="shrink-0 text-danger" aria-hidden />
              {error}
            </p>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-[480px] px-4 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        <p className="text-center text-sm text-white/80">{hint}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-white text-base font-semibold text-ink"
          >
            <ImageUp size={20} strokeWidth={1.75} aria-hidden /> Tải ảnh QR lên
          </button>
          <button
            type="button"
            onClick={onManual}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] border border-white/30 px-4 text-base font-semibold"
          >
            <Keyboard size={20} strokeWidth={1.75} aria-hidden /> Nhập tay
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} aria-label="Chọn ảnh QR" />
      </div>
    </div>
  )
}
