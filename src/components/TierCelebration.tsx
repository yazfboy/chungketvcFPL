import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import type { Tier } from '../lib/types'
import { APP_NAME } from '../lib/app'
import { EASE } from '../lib/motion'

interface Celebration {
  name: string
  memberId: string
  from: Tier
  to: Tier
}

const Ctx = createContext<(c: Celebration) => void>(() => {})

const SHOW_MS = 1600

/** Màn chúc mừng lên hạng (~1.6s, chạm để đóng): thẻ mini chuyển màu hạng cũ → mới. Không confetti. */
export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<(Celebration & { key: number }) | null>(null)
  const celebrate = useCallback((c: Celebration) => setCurrent({ ...c, key: Date.now() }), [])
  const value = useMemo(() => celebrate, [celebrate])
  return (
    <Ctx.Provider value={value}>
      {children}
      {current && <Overlay key={current.key} c={current} onClose={() => setCurrent(null)} />}
    </Ctx.Provider>
  )
}

export function useCelebrate(): (c: Celebration) => void {
  return useContext(Ctx)
}

function Overlay({ c, onClose }: { c: Celebration; onClose: () => void }) {
  const reduce = useReducedMotion()
  const [color, setColor] = useState(reduce ? c.to.color : c.from.color)

  useEffect(() => {
    const t1 = window.setTimeout(() => setColor(c.to.color), 250)
    const t2 = window.setTimeout(onClose, SHOW_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [c.to.color, onClose])

  return createPortal(
    <div
      role="alertdialog"
      aria-label={`Chúc mừng ${c.name} lên hạng ${c.to.name}`}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center bg-black/55 px-8"
    >
      <motion.div
        className="w-full max-w-[300px] text-center"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        <div
          className="relative mx-auto flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-[16px] p-4 text-left text-white"
          style={{ backgroundColor: color, transition: reduce ? undefined : 'background-color 700ms cubic-bezier(0.2,0.8,0.2,1)' }}
        >
          <span className="pointer-events-none absolute -top-1/2 left-[38%] h-[200%] w-[34%] rotate-[24deg] bg-white opacity-[0.07]" aria-hidden />
          <div className="relative flex justify-between text-sm font-semibold">
            <span>{APP_NAME}</span>
            <span className="uppercase tracking-[0.12em]">{color === c.to.color ? c.to.name : c.from.name}</span>
          </div>
          <span className="relative font-mono text-lg font-semibold tracking-[0.14em]">{c.memberId}</span>
        </div>
        <p className="mt-6 text-lg font-semibold text-white">Chúc mừng {c.name}</p>
        <p className="mt-1 text-[32px] leading-tight font-bold tracking-[-0.02em] text-white">Lên hạng {c.to.name}</p>
        <p className="mt-4 text-sm text-white/70">Chạm để đóng</p>
      </motion.div>
    </div>,
    document.body,
  )
}
