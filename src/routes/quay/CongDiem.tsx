import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { CountUp } from '../../components/CountUp'
import { useCelebrate } from '../../components/TierCelebration'
import { ArrowRight, CircleAlert, ScanLine, Sparkles, TrendingUp } from 'lucide-react'
import { matchCounterInput, upsellHint } from '../../lib/counter'
import { ScanSheet } from '../../components/ScanSheet'
import { PageHeader } from '../../components/ui/PageHeader'
import { Field, inputClass } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { TierChip } from '../../components/TierChip'
import { SampleLoadBlock } from '../../components/SampleLoadBlock'
import { useStore } from '../../store/AppStore'
import {
  VND_PER_POINT,
  duplicateTxnMessage,
  earnPoints,
  findMember,
  generateTxnCode,
  getTier,
  normalizeMemberId,
  normalizePhone,
  normalizeTxnCode,
  pointsForAmount,
  tierRank,
  txnCodeUsage,
  validateAmount,
  MAX_AMOUNT,
} from '../../lib/rules'
import { formatNumber, formatVnd, maskPhone, parseDigits } from '../../lib/format'
import { feedbackError, feedbackSuccess } from '../../lib/feedback'
import { SAMPLE_TEST_ID } from '../../lib/seed'
import { EASE } from '../../lib/motion'

function formatAmountInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10)
  return digits ? formatNumber(Number(digits)) : ''
}

export default function CongDiem() {
  const { hasData } = useStore()
  if (!hasData)
    return (
      <>
        <PageHeader title="Cộng điểm" subtitle="Nhập mã thành viên và số tiền hoá đơn" />
        <SampleLoadBlock />
      </>
    )
  return <EarnForm />
}

function EarnForm() {
  const { state, run } = useStore()
  const toast = useToast()
  const [params] = useSearchParams()

  const [memberInput, setMemberInput] = useState(params.get('ma') ?? '')
  const [memberTouched, setMemberTouched] = useState(!!params.get('ma'))
  const [amountText, setAmountText] = useState(formatAmountInput(params.get('tien') ?? ''))
  const [amountTouched, setAmountTouched] = useState(!!params.get('tien'))
  const [code, setCode] = useState(params.get('gd') ?? '')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [shake, setShake] = useState(0)
  const [scanOpen, setScanOpen] = useState(false)
  const [gain, setGain] = useState({ key: 0, points: 0 })
  const celebrate = useCelebrate()
  const reduce = useReducedMotion()

  const memberRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)

  // Focus ô đầu tiên còn trống (tương thích máy quét: ô mã TV focus sẵn).
  useEffect(() => {
    if (!params.get('ma')) memberRef.current?.focus()
    else if (!params.get('tien')) amountRef.current?.focus()
  }, [params])

  // Nhận mã KT-xxx, SĐT đầy đủ hoặc 4 số cuối: khớp 1 → chọn luôn; khớp nhiều → chọn nhanh.
  const matches = matchCounterInput(state, memberInput)
  const member = matches.length === 1 ? matches[0] : undefined
  const showNotFound =
    !!memberInput.trim() && matches.length === 0 && (memberTouched || normalizeMemberId(memberInput).length >= 6)

  const amount = parseDigits(amountText)
  const amountError = validateAmount(amount)
  const showAmountError = !!amountText && !!amountError && (amountTouched || (amount ?? 0) > MAX_AMOUNT)

  const used = txnCodeUsage(state, code)
  const dupError = used ? duplicateTxnMessage(code, used) : null

  const points = !amountError && amount != null ? pointsForAmount(amount) : 0
  const oldTier = member ? getTier(member.points) : null
  const newTier = member ? getTier(member.points + points) : null
  const tierUp = !!oldTier && !!newTier && tierRank(newTier) > tierRank(oldTier)
  const upsell = member ? upsellHint(member.points + points) : null

  const canSubmit = !!member && !amountError && normalizeTxnCode(code).length > 0

  function submit() {
    if (!canSubmit || amount == null || !member) return
    const r = run((s) => earnPoints(s, { memberId: member.id, amount, txnCode: code }))
    if (!r.ok) {
      setSubmitError(r.error)
      setShake((n) => n + 1)
      feedbackError()
      if (txnCodeUsage(state, code)) codeRef.current?.focus()
      return
    }
    feedbackSuccess()
    setSubmitError(null)
    toast.show(`Đã cộng +${formatNumber(r.pointsAdded)} điểm cho ${r.member.name} (${r.member.id})`)
    setGain((g) => ({ key: g.key + 1, points: r.pointsAdded }))
    if (tierRank(r.newTier) > tierRank(r.oldTier))
      window.setTimeout(() => celebrate({ name: r.member.name, memberId: r.member.id, from: r.oldTier, to: r.newTier }), 450)
    setAmountText('')
    setAmountTouched(false)
    setCode('')
    amountRef.current?.focus()
  }

  function onMemberKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    setMemberTouched(true)
    if (matchCounterInput(state, memberInput).length === 1) amountRef.current?.focus()
  }

  function onAmountKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    setAmountTouched(true)
    codeRef.current?.focus()
  }

  function onCodeKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    submit()
  }

  const generalError = submitError && !dupError ? submitError : null

  return (
    <>
      <PageHeader title="Cộng điểm" subtitle={`Tỉ lệ ${formatVnd(VND_PER_POINT)} = 1 điểm`} />
      <form
        noValidate
        className="flex flex-col gap-5 px-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div>
          <Field
            id="ma-tv"
            label="Mã thành viên hoặc SĐT"
            error={showNotFound ? 'Không tìm thấy thành viên' : undefined}
            hint={
              <span className="flex items-center gap-2">
                Mã thử:
                <button
                  type="button"
                  onClick={() => {
                    setMemberInput(SAMPLE_TEST_ID)
                    setMemberTouched(true)
                    amountRef.current?.focus()
                  }}
                  className="num inline-flex min-h-11 items-center rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink"
                >
                  {SAMPLE_TEST_ID}
                </button>
              </span>
            }
          >
            <div className="relative">
            <input
              ref={memberRef}
              id="ma-tv"
              className={`${inputClass} num pr-14 uppercase`}
              value={memberInput}
              onChange={(e) => {
                setMemberInput(e.target.value)
                setSubmitError(null)
              }}
              onBlur={() => setMemberTouched(true)}
              onKeyDown={onMemberKey}
              placeholder="KT-004 · SĐT · 4 số cuối"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="next"
              aria-invalid={showNotFound}
            />
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              aria-label="Quét QR thẻ thành viên bằng camera"
              className="absolute top-0.5 right-0.5 flex h-11 w-11 items-center justify-center rounded-[8px] text-accent"
            >
              <ScanLine size={20} strokeWidth={1.75} aria-hidden />
            </button>
            </div>
          </Field>
          <ScanSheet
            open={scanOpen}
            title="Quét QR thẻ thành viên"
            hint="Đưa mã QR trên thẻ vào khung. Hoặc tải ảnh QR (VD: QR-KT-004.png)."
            onClose={() => setScanOpen(false)}
            onManual={() => {
              setScanOpen(false)
              window.setTimeout(() => memberRef.current?.focus(), 50)
            }}
            onResult={(text) => {
              const id = normalizeMemberId(text)
              setScanOpen(false)
              setMemberInput(id)
              setMemberTouched(true)
              setSubmitError(null)
              if (findMember(state, id)) {
                feedbackSuccess()
                window.setTimeout(() => amountRef.current?.focus(), 50)
              } else feedbackError()
            }}
          />

          {matches.length > 1 && (
            <div className="mt-3">
              <p className="text-sm text-muted">{matches.length} thành viên có SĐT đuôi {normalizePhone(memberInput)} — chọn một:</p>
              <ul className="mt-2 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
                {matches.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setMemberInput(m.id)
                        setMemberTouched(true)
                        amountRef.current?.focus()
                      }}
                      className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left active:bg-bg"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{m.name}</span>
                        <span className="num block text-sm text-muted">
                          {m.id} · {maskPhone(m.phone)}
                        </span>
                      </span>
                      <TierChip tier={getTier(m.points)} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {member && oldTier && (
              <motion.div
                key={member.id}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="relative mt-3 flex items-center gap-3 rounded-[14px] border border-line bg-surface p-3"
                style={{ borderLeft: `4px solid ${oldTier.color}`, transition: 'border-color 600ms' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{member.name}</p>
                  <p className="num text-sm text-muted">
                    {member.id} · {maskPhone(member.phone)}
                  </p>
                </div>
                <div className="relative text-right">
                  <TierChip tier={oldTier} />
                  <p className="num mt-1 text-lg leading-tight font-bold">
                    <CountUp value={member.points} /> <span className="text-sm font-medium text-muted">điểm</span>
                  </p>
                  {gain.key > 0 && !reduce && (
                    <motion.span
                      key={gain.key}
                      aria-hidden
                      className="num pointer-events-none absolute right-0 -top-2 text-xl font-bold text-accent"
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: -30, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 0.9, ease: EASE, times: [0, 0.15, 0.6, 1] }}
                    >
                      +{formatNumber(gain.points)}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
        </div>

        <Field id="so-tien" label="Số tiền (đ)" error={showAmountError ? amountError : undefined}>
          <input
            ref={amountRef}
            id="so-tien"
            className={`${inputClass} num`}
            value={amountText}
            onChange={(e) => {
              setAmountText(formatAmountInput(e.target.value))
              setSubmitError(null)
            }}
            onBlur={() => setAmountTouched(true)}
            onKeyDown={onAmountKey}
            inputMode="numeric"
            placeholder="VD: 1.000.000"
            autoComplete="off"
            enterKeyHint="next"
            aria-invalid={showAmountError}
          />
        </Field>

        <div>
          <label htmlFor="ma-gd" className="mb-1.5 block text-sm font-semibold">
            Mã giao dịch
          </label>
          <div className="flex gap-2">
            <input
              ref={codeRef}
              id="ma-gd"
              className={`${inputClass} num min-w-0 flex-1 uppercase`}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setSubmitError(null)
              }}
              onKeyDown={onCodeKey}
              placeholder="VD: TX-NEW-001"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="done"
              aria-invalid={!!dupError}
              aria-describedby={dupError ? 'ma-gd-error' : undefined}
            />
            <Button variant="secondary" className="h-12 shrink-0 px-3 text-sm" onClick={() => setCode(generateTxnCode(state))}>
              Tự sinh
            </Button>
          </div>
          {dupError && (
            <motion.div
              key={shake}
              id="ma-gd-error"
              role="alert"
              initial={shake ? { x: -6 } : false}
              animate={{ x: 0 }}
              transition={{ type: 'spring', stiffness: 900, damping: 18 }}
              className="mt-2 flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
            >
              <CircleAlert size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
              <span>{dupError}</span>
            </motion.div>
          )}
        </div>

        {member && oldTier && newTier && points > 0 && (
          <div className="rounded-[14px] bg-accent-soft p-4">
            <p className="text-sm text-muted">Xem trước</p>
            <p className="num mt-0.5 text-lg font-bold text-accent">
              Sẽ cộng +{formatNumber(points)} điểm
              <span className="font-medium text-muted">
                {' '}
                · {formatVnd(amount ?? 0)} ÷ {formatVnd(VND_PER_POINT)}
              </span>
            </p>
            <p className="num mt-1 flex flex-wrap items-center gap-1.5 text-sm">
              Số dư {formatNumber(member.points)} <ArrowRight size={14} strokeWidth={1.75} aria-hidden />{' '}
              <span className="font-semibold">{formatNumber(member.points + points)}</span>
              {tierUp && (
                <span className="ml-1 inline-flex items-center gap-1 font-semibold">
                  <Sparkles size={14} strokeWidth={1.75} aria-hidden /> lên hạng <TierChip tier={newTier} />
                </span>
              )}
            </p>
          </div>
        )}

        {upsell && (
          <p className="num -mt-2 flex items-center gap-2 text-sm font-medium">
            <TrendingUp size={16} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden />
            Mua thêm {formatVnd(upsell.amount)} để lên hạng {upsell.tier.name}
          </p>
        )}

        {generalError && (
          <p role="alert" className="flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <CircleAlert size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
            {generalError}
          </p>
        )}

        <Button type="submit" full disabled={!canSubmit} className="min-h-[52px] text-[17px]">
          Cộng điểm
        </Button>
      </form>
    </>
  )
}
