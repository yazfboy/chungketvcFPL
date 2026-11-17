import { useRef } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import type { Member } from '../lib/types'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import { useToast } from './ui/Toast'

/** QR trên thẻ: payload = đúng mã thành viên (chuẩn sheet KT_MaQR). */
export function QrSheet({ member, open, onClose }: { member: Member; open: boolean; onClose: () => void }) {
  const canvasWrap = useRef<HTMLDivElement>(null)
  const toast = useToast()

  function download() {
    try {
      const canvas = canvasWrap.current?.querySelector('canvas')
      if (!canvas) throw new Error('no canvas')
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `QR-${member.id}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      toast.show(`Đã tải QR-${member.id}.png`)
    } catch {
      toast.show('Không tải được ảnh QR trên trình duyệt này', 'error')
    }
  }

  return (
    <Sheet open={open} title="Mã QR thành viên" onClose={onClose}>
      <div className="flex flex-col items-center pb-2 text-center">
        <div className="rounded-[14px] border border-line bg-white p-2">
          <QRCodeSVG value={member.id} size={220} level="M" marginSize={4} title={`QR ${member.id}`} />
        </div>
        <p className="mt-4 font-mono text-[28px] leading-none font-semibold tracking-[0.12em]">{member.id}</p>
        <p className="mt-2 text-sm text-muted">Đưa mã này cho nhân viên quầy quét</p>
        <Button variant="secondary" full className="mt-5" onClick={download}>
          <Download size={20} strokeWidth={1.75} aria-hidden /> Tải ảnh QR
        </Button>
        {/* Canvas ẩn, độ phân giải cao để tải ảnh PNG (dùng thử quét ảnh ở Quầy). */}
        <div ref={canvasWrap} className="hidden" aria-hidden>
          <QRCodeCanvas value={member.id} size={512} level="M" marginSize={4} />
        </div>
      </div>
    </Sheet>
  )
}
