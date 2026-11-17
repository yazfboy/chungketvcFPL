import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function Empty({ icon: Icon, title, hint, action }: { icon: LucideIcon; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <Icon size={28} strokeWidth={1.75} className="text-muted" aria-hidden />
      <p className="mt-3 font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
