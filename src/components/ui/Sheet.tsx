import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { EASE } from '../../lib/motion'

/**
 * Bottom sheet nền trắng. Chỉ có animation vào (đóng là gỡ ngay) → không bao giờ kẹt.
 * Đóng bằng: nút X, chạm nền tối, phím Esc.
 */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="relative max-h-[90dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[16px] bg-surface px-4 pt-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <div className="mx-auto mt-1 h-1 w-10 rounded-full bg-line" aria-hidden />
        <div className="flex items-center justify-between gap-2 pt-2 pb-3">
          <h2 className="text-lg font-bold tracking-[-0.02em]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-[10px] text-muted"
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        {children}
      </motion.div>
    </div>,
    document.body,
  )
}
