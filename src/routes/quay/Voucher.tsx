import { useRef, useState, type FormEvent } from 'react'
import { CircleAlert, CircleCheck, Gift, ScanLine } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Field, inputClass } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { ScanSheet } from '../../components/ScanSheet'
import { SampleLoadBlock } from '../../components/SampleLoadBlock'
import { TierChip } from '../../components/TierChip'
import { useStore } from '../../store/AppStore'
import { findReward, getTier, useVoucher as applyVoucher } from '../../lib/rules'
import { formatDateTime } from '../../lib/format'
import { feedbackError, feedbackSuccess } from '../../lib/feedback'

const normalizeCode = (s: string) => s.trim().toUpperCase()

export default function Voucher() {
  const { state, hasData, run } = useStore()
  const toast = useToast()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState<string | null>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!hasData)
    return (
      <>
        <PageHeader title="Voucher" subtitle="Xác nhận khách dùng ưu đãi" />
        <SampleLoadBlock />
      </>
    )

  const voucher = query ? state.vouchers.find((v) => v.code === query) : undefined
  const reward = voucher ? findReward(state, voucher.rewardId) : undefined
  const owner = voucher ? state.members.find((m) => m.id === voucher.memberId) : undefined

  function lookup(code: string) {
    const c = normalizeCode(code)
    setQuery(c || null)
    if (c && !state.vouchers.some((v) => v.code === c)) feedbackError()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    lookup(input)
  }

  function confirmUse() {
    if (!query) return
    const r = run((s) => applyVoucher(s, query))
    if (!r.ok) {
      feedbackError()
      toast.show(r.error, 'error')
      return
    }
    feedbackSuccess()
    toast.show(`Đã xác nhận dùng ${r.reward?.name ?? 'voucher'}${r.member ? ` cho ${r.member.name}` : ''}`)
  }

  return (
    <>
      <PageHeader title="Voucher" subtitle="Nhập hoặc quét mã voucher trong ví của khách" />
      <form noValidate onSubmit={submit} className="flex flex-col gap-3 px-4">
        <Field id="ma-voucher" label="Mã voucher">
          <div className="relative">
            <input
              ref={inputRef}
              id="ma-voucher"
              className={`${inputClass} num pr-14 font-mono uppercase`}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setQuery(null)
              }}
              placeholder="VD: XS-AB12-CD34"
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="search"
            />
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              aria-label="Quét QR voucher bằng camera"
              className="absolute top-0.5 right-0.5 flex h-11 w-11 items-center justify-center rounded-[8px] text-accent"
            >
              <ScanLine size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </Field>
        <Button type="submit" variant="secondary" full disabled={!input.trim()}>
          Kiểm tra mã
        </Button>
      </form>

      <ScanSheet
        open={scanOpen}
        title="Quét QR voucher"
        hint="Đưa mã QR voucher trong ví của khách vào khung, hoặc tải ảnh QR lên."
        onClose={() => setScanOpen(false)}
        onManual={() => {
          setScanOpen(false)
          window.setTimeout(() => inputRef.current?.focus(), 50)
        }}
        onResult={(text) => {
          setScanOpen(false)
          setInput(normalizeCode(text))
          lookup(text)
          if (state.vouchers.some((v) => v.code === normalizeCode(text))) feedbackSuccess()
        }}
      />

      <div className="mt-5 px-4">
        {query && !voucher && (
          <p role="alert" className="flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <CircleAlert size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
            Không tìm thấy voucher {query}. Kiểm tra lại mã dạng XS-XXXX-XXXX.
          </p>
        )}

        {voucher && (
          <section className="rounded-[14px] border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-center gap-2 text-lg font-bold tracking-[-0.02em]">
                <Gift size={20} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden />
                {reward?.name ?? voucher.rewardId}
              </p>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                  voucher.status === 'da_dung' ? 'border border-line text-muted' : 'bg-accent text-white'
                }`}
              >
                {voucher.status === 'da_dung' ? 'Đã dùng' : 'Chưa dùng'}
              </span>
            </div>
            <p className="mt-1 font-mono text-base font-semibold tracking-[0.06em]">{voucher.code}</p>
            {reward?.description && <p className="mt-1 text-sm text-muted">{reward.description}</p>}

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
              <div className="min-w-0">
                <p className="text-sm text-muted">Chủ voucher</p>
                <p className="truncate font-semibold">
                  {owner?.name ?? 'Không rõ'} <span className="num font-normal text-muted">· {voucher.memberId}</span>
                </p>
              </div>
              {owner && <TierChip tier={getTier(owner.points)} />}
            </div>
            <p className="num mt-2 text-sm text-muted">Đổi lúc {formatDateTime(voucher.createdAt)}</p>

            {voucher.status === 'da_dung' ? (
              <p role="status" className="mt-4 flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/5 p-3 text-sm font-medium text-danger">
                <CircleCheck size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
                Voucher đã được sử dụng lúc {voucher.usedAt ? formatDateTime(voucher.usedAt) : '—'}
              </p>
            ) : (
              <Button full className="mt-4 min-h-[52px]" onClick={confirmUse}>
                Xác nhận sử dụng
              </Button>
            )}
          </section>
        )}
      </div>
    </>
  )
}
