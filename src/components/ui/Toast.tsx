import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Award, CircleAlert, CircleCheck } from 'lucide-react'
import { EASE } from '../../lib/motion'

export type ToastTone = 'success' | 'error' | 'tierup'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
  color?: string
}

interface ToastApi {
  show: (message: string, tone?: ToastTone, color?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** Toast hiện ở phía trên (dưới header) để không che ô nhập khi bàn phím ảo bật. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const show = useCallback((message: string, tone: ToastTone = 'success', color?: string) => {
    const id = nextId.current++
    setItems((xs) => [...xs.slice(-1), { id, message, tone, color }])
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), tone === 'tierup' ? 4000 : 2800)
  }, [])

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[68px] z-[60] mx-auto flex max-w-[480px] flex-col gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE }}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-2 rounded-[10px] px-3 py-3 text-sm font-medium text-white ${
                t.tone === 'error' ? 'bg-danger' : t.tone === 'tierup' ? '' : 'bg-ink'
              }`}
              style={t.tone === 'tierup' ? { background: t.color ?? 'var(--accent)' } : undefined}
            >
              {t.tone === 'error' ? (
                <CircleAlert size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
              ) : t.tone === 'tierup' ? (
                <Award size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
              ) : (
                <CircleCheck size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
              )}
              <span className={t.tone === 'tierup' ? 'text-base font-bold' : ''}>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const t = useContext(ToastContext)
  if (!t) throw new Error('useToast phải nằm trong ToastProvider')
  return t
}
