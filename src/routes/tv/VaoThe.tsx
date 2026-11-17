import { useMemo, useState, type FormEvent } from 'react'
import { ChevronLeft, UserPlus } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Field, inputClass } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { SampleTag } from '../../components/ui/SampleTag'
import { TierChip } from '../../components/TierChip'
import { SampleLoadBlock } from '../../components/SampleLoadBlock'
import { useStore } from '../../store/AppStore'
import { findMemberByIdOrPhone, getTier, isValidPhone, normalizePhone, register } from '../../lib/rules'
import { formatNumber } from '../../lib/format'
import { feedbackSuccess } from '../../lib/feedback'
import { SAMPLE_TEST_ID } from '../../lib/seed'
import type { Member } from '../../lib/types'

type Mode = { kind: 'open' } | { kind: 'register' } | { kind: 'welcome'; member: Member }

export default function VaoThe() {
  const [mode, setMode] = useState<Mode>({ kind: 'open' })
  if (mode.kind === 'register') return <RegisterForm onBack={() => setMode({ kind: 'open' })} onDone={(m) => setMode({ kind: 'welcome', member: m })} />
  if (mode.kind === 'welcome') return <Welcome member={mode.member} />
  return <OpenCard onRegister={() => setMode({ kind: 'register' })} />
}

function OpenCard({ onRegister }: { onRegister: () => void }) {
  const { state, hasData, setCurrentMemberId } = useStore()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const samples = useMemo(
    () =>
      state.members
        .filter((m) => m.source === 'mau')
        .sort((a, b) => (a.id === SAMPLE_TEST_ID ? -1 : b.id === SAMPLE_TEST_ID ? 1 : a.id.localeCompare(b.id))),
    [state.members],
  )

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return setError('Nhập số điện thoại hoặc mã thành viên')
    const m = findMemberByIdOrPhone(state, query)
    if (!m) return setError(`Không tìm thấy thẻ với “${query.trim()}”. Kiểm tra SĐT 10 số hoặc mã dạng KT-004.`)
    setCurrentMemberId(m.id)
  }

  return (
    <>
      <PageHeader title="Vào thẻ của bạn" subtitle="Mở thẻ bằng số điện thoại hoặc mã thành viên" />
      {!hasData ? (
        <>
          <SampleLoadBlock />
          <div className="mt-6 px-4">
            <Button variant="secondary" full onClick={onRegister}>
              <UserPlus size={20} strokeWidth={1.75} aria-hidden /> Đăng ký thành viên
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-6 px-4">
          <form noValidate onSubmit={submit} className="flex flex-col gap-3">
            <Field id="mo-the" label="SĐT hoặc mã thành viên" error={error}>
              <input
                id="mo-the"
                className={`${inputClass} num`}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setError(null)
                }}
                placeholder="VD: 0900001004 hoặc KT-004"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                enterKeyHint="go"
                aria-invalid={!!error}
              />
            </Field>
            <Button type="submit" full className="min-h-[52px]">
              Mở thẻ
            </Button>
            <Button variant="secondary" full onClick={onRegister}>
              <UserPlus size={20} strokeWidth={1.75} aria-hidden /> Đăng ký thành viên
            </Button>
          </form>

          {samples.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-[-0.02em]">Dùng thử nhanh</h2>
                <SampleTag />
              </div>
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
                {samples.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentMemberId(m.id)}
                      className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left active:bg-bg"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{m.name}</span>
                        <span className="num flex items-center gap-2 text-sm text-muted">
                          {m.id}
                          {m.id === SAMPLE_TEST_ID && (
                            <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">Mã thử</span>
                          )}
                        </span>
                      </span>
                      <TierChip tier={getTier(m.points)} />
                      <span className="num w-16 text-right font-bold">{formatNumber(m.points)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  )
}

function RegisterForm({ onBack, onDone }: { onBack: () => void; onDone: (m: Member) => void }) {
  const { state, run, setCurrentMemberId } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState({ name: false, phone: false })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const nameError = !name.trim() ? 'Nhập họ tên' : name.trim().length > 60 ? 'Họ tên tối đa 60 ký tự' : null
  const phoneValid = isValidPhone(phone)
  const dup = phoneValid ? state.members.find((m) => m.phone === normalizePhone(phone)) : undefined
  const phoneError = !phone.trim()
    ? 'Nhập số điện thoại'
    : !phoneValid
      ? 'Số điện thoại cần đủ 10 số, bắt đầu bằng 0'
      : dup
        ? `SĐT này đã là thành viên ${dup.id}`
        : null

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, phone: true })
    if (nameError || phoneError) return
    const r = run((s) => register(s, { name, phone }))
    if (!r.ok) return setSubmitError(r.error)
    feedbackSuccess()
    onDone(r.member)
  }

  return (
    <>
      <div className="px-2 pt-2">
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-muted">
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden /> Mở thẻ
        </button>
      </div>
      <PageHeader title="Đăng ký thành viên" subtitle="Miễn phí · nhận mã thẻ ngay" />
      <form noValidate onSubmit={submit} className="flex flex-col gap-5 px-4">
        <Field id="ho-ten" label="Họ tên" error={touched.name ? nameError : undefined}>
          <input
            id="ho-ten"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="VD: Lan Phạm"
            autoComplete="name"
            enterKeyHint="next"
            maxLength={80}
            aria-invalid={touched.name && !!nameError}
          />
        </Field>
        <Field
          id="sdt"
          label="Số điện thoại"
          error={
            (touched.phone || dup) && phoneError ? (
              dup ? (
                <span className="flex flex-col items-start gap-2">
                  {phoneError}
                  <Button variant="secondary" className="text-sm" onClick={() => setCurrentMemberId(dup.id)}>
                    Mở thẻ {dup.id}
                  </Button>
                </span>
              ) : (
                phoneError
              )
            ) : undefined
          }
        >
          <input
            id="sdt"
            type="tel"
            inputMode="tel"
            className={`${inputClass} num`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="VD: 0912345678"
            autoComplete="tel"
            enterKeyHint="done"
            maxLength={16}
            aria-invalid={(touched.phone || !!dup) && !!phoneError}
          />
        </Field>
        {submitError && <p role="alert" className="text-sm text-danger">{submitError}</p>}
        <Button type="submit" full className="min-h-[52px]">
          Đăng ký
        </Button>
      </form>
    </>
  )
}

function Welcome({ member }: { member: Member }) {
  const { setCurrentMemberId } = useStore()
  return (
    <div className="px-4 pt-10">
      <p className="text-sm font-semibold text-accent">Đăng ký thành công</p>
      <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-[-0.02em]">Chào mừng, {member.name}</h1>
      <p className="mt-6 text-sm text-muted">Mã thành viên của bạn</p>
      <p className="mt-1 font-mono text-[40px] leading-none font-semibold tracking-[0.12em]">{member.id}</p>
      <p className="mt-4 text-sm text-muted">Đọc mã này hoặc số điện thoại ở quầy để tích điểm. Bắt đầu ở hạng Đồng với 0 điểm.</p>
      <Button full className="mt-8 min-h-[52px]" onClick={() => setCurrentMemberId(member.id)}>
        Vào thẻ
      </Button>
    </div>
  )
}
