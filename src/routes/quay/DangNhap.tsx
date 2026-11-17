import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Info } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Field, inputClass } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { useStore } from '../../store/AppStore'
import { DEMO_PASS, DEMO_USER, checkQuayLogin } from '../../lib/auth'

/**
 * Màn "Đăng nhập Quầy" — cổng phân vai MÔ PHỎNG cho demo web tĩnh, không phải bảo mật thật.
 * Tài khoản demo điền sẵn để giám khảo chỉ cần bấm "Vào Quầy".
 */
export default function DangNhap() {
  const { setQuayAuthed } = useStore()
  const toast = useToast()
  const [user, setUser] = useState(DEMO_USER)
  const [pass, setPass] = useState(DEMO_PASS)
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!checkQuayLogin(user, pass)) return setError('Sai tài khoản hoặc mật khẩu')
    setQuayAuthed(true)
    toast.show('Đã vào Quầy')
  }

  return (
    <>
      <PageHeader title="Đăng nhập Quầy" subtitle="Dành cho nhân viên cộng điểm và xác nhận voucher" />
      <form noValidate onSubmit={submit} className="flex flex-col gap-5 px-4">
        <Field id="tai-khoan" label="Tài khoản">
          <input
            id="tai-khoan"
            className={inputClass}
            value={user}
            onChange={(e) => {
              setUser(e.target.value)
              setError(null)
            }}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
          />
        </Field>
        <Field id="mat-khau" label="Mật khẩu" error={error}>
          <div className="relative">
            <input
              id="mat-khau"
              type={show ? 'text' : 'password'}
              className={`${inputClass} pr-14`}
              value={pass}
              onChange={(e) => {
                setPass(e.target.value)
                setError(null)
              }}
              autoComplete="current-password"
              enterKeyHint="go"
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={show}
              className="absolute top-0.5 right-0.5 flex h-11 w-11 items-center justify-center rounded-[8px] text-muted"
            >
              {show ? <EyeOff size={20} strokeWidth={1.75} aria-hidden /> : <Eye size={20} strokeWidth={1.75} aria-hidden />}
            </button>
          </div>
        </Field>
        <p className="flex items-start gap-2 rounded-[10px] bg-accent-soft p-3 text-sm">
          <Info size={20} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden />
          <span>
            Tài khoản demo: <span className="font-semibold">{DEMO_USER}</span> / <span className="font-semibold">{DEMO_PASS}</span>. Cổng
            phân vai mô phỏng cho bản demo, không phải bảo mật thật.
          </span>
        </p>
        <Button type="submit" full className="min-h-[52px]">
          Vào Quầy
        </Button>
      </form>
    </>
  )
}
