import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface TabItem {
  to: string
  label: string
  icon: LucideIcon
}

/** Ẩn tab bar khi đang gõ để không che ô nhập/khung lỗi lúc bàn phím ảo bật. */
function useTyping(): boolean {
  const [typing, setTyping] = useState(false)
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')
    const onIn = (e: FocusEvent) => setTyping(isField(e.target))
    const onOut = () => setTyping(false)
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])
  return typing
}

export function TabBar({ items }: { items: TabItem[] }) {
  const typing = useTyping()
  return (
    <nav
      aria-label="Điều hướng chính"
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface ${typing ? 'max-md:hidden' : ''}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-16 max-w-[480px]">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex h-full min-h-11 flex-col items-center justify-center gap-1 text-xs ${
                  isActive ? 'font-bold text-accent' : 'font-medium text-muted'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
