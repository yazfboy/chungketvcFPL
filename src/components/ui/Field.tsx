import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'

export const inputClass =
  'h-12 w-full rounded-[10px] border border-line bg-surface px-3 text-base text-ink outline-none placeholder:text-muted/70 focus:border-accent aria-[invalid=true]:border-danger'

/** Ô nhập có label luôn hiển thị và lỗi ngay dưới ô. */
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: ReactNode
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <div className="mt-1.5 text-sm text-muted">{hint}</div>
      ) : null}
    </div>
  )
}
