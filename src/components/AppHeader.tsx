import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import type { Role } from '../store/storage'
import { APP_NAME } from '../lib/app'

const ROLES: { id: Role; label: string }[] = [
  { id: 'tv', label: 'Thành viên' },
  { id: 'quay', label: 'Quầy' },
]

export function AppHeader({ role, onRoleChange }: { role: Role; onRoleChange: (r: Role) => void }) {
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
          {role === 'quay' && (
            <Link
              to="/quay/du-lieu"
              aria-label="Dữ liệu và cài đặt"
              className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface"
            >
              <MoreHorizontal size={20} strokeWidth={1.75} aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
