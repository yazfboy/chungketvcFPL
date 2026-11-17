import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Database, LogOut, MoreHorizontal, Play } from 'lucide-react'
import type { Role } from '../store/storage'
import { APP_NAME } from '../lib/app'

const ROLES: { id: Role; label: string }[] = [
  { id: 'tv', label: 'Thành viên' },
  { id: 'quay', label: 'Quầy' },
]

export function AppHeader({
  role,
  onRoleChange,
  onReplayIntro,
  onLogout,
}: {
  role: Role
  onRoleChange: (r: Role) => void
  onReplayIntro: () => void
  onLogout?: () => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg">
      <div className="mx-auto flex h-[60px] max-w-[480px] items-center gap-2 px-4">
        <Link to="/" className="flex min-h-11 items-center gap-1.5 pr-2" aria-label={`${APP_NAME} — trang đầu`}>
          <span className="block h-5 w-1.5 rounded-sm bg-accent" aria-hidden />
          <span className="text-[22px] leading-none font-bold tracking-[-0.03em]">{APP_NAME}</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div role="tablist" aria-label="Chọn vai" className="flex rounded-[12px] border border-line bg-surface p-0.5">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={role === r.id}
                onClick={() => onRoleChange(r.id)}
                className={`min-h-11 rounded-[10px] px-3 text-sm ${
                  role === r.id ? 'bg-accent font-bold text-white' : 'font-medium text-muted'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {role === 'quay' && <QuayMenu onReplayIntro={onReplayIntro} onLogout={onLogout} />}
        </div>
      </div>
    </header>
  )
}

function QuayMenu({ onReplayIntro, onLogout }: { onReplayIntro: () => void; onLogout?: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item = 'flex min-h-12 w-full items-center gap-3 px-4 text-left text-base font-medium active:bg-bg'
  const pick = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Menu quầy"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface"
      >
        <MoreHorizontal size={20} strokeWidth={1.75} aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[52px] right-0 z-40 w-64 overflow-hidden rounded-[14px] border border-line bg-surface py-1 shadow-[0_1px_2px_rgba(0,0,0,.04)]"
        >
          <button role="menuitem" type="button" className={item} onClick={pick(() => navigate('/quay/du-lieu'))}>
            <Database size={20} strokeWidth={1.75} aria-hidden /> Dữ liệu & ca kiểm tra
          </button>
          <button role="menuitem" type="button" className={item} onClick={pick(onReplayIntro)}>
            <Play size={20} strokeWidth={1.75} aria-hidden /> Xem lại màn mở đầu
          </button>
          {onLogout && (
            <button role="menuitem" type="button" className={`${item} border-t border-line text-danger`} onClick={pick(onLogout)}>
              <LogOut size={20} strokeWidth={1.75} aria-hidden /> Đăng xuất
            </button>
          )}
        </div>
      )}
    </div>
  )
}
