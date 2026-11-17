import { useEffect } from 'react'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion'

/** Intro ≤ 1.1s: wordmark trượt lên, vạch màu nhấn quét ngang. Chạm để bỏ qua. */
export function Intro({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 900)
    return () => window.clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="Bỏ qua phần giới thiệu"
      onClick={onDone}
      onKeyDown={onDone}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-bg"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      <div className="overflow-hidden">
        <motion.p
          className="text-[34px] font-bold tracking-[-0.02em]"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {name}
        </motion.p>
      </div>
      <motion.span
        className="mt-3 block h-1 w-24 origin-left rounded-full bg-accent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
      />
    </motion.div>
  )
}
