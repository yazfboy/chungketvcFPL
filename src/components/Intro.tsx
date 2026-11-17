import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion'

/**
 * Màn mở đầu (~1.5s):
 *  150ms  chữ "XSon" trồi lên từng chữ cái (stagger 70ms, 450ms)
 *  650ms  vạch mảnh quét từ trái + dòng "Thẻ thành viên"
 *  1050ms màn nền màu nhấn kéo lên (clip-path), cụm chữ dịch lên & mờ; app bên dưới scale 0.98→1
 * Chạm bất kỳ → kéo màn nhanh 200ms. Không xoay, không nảy, không particle.
 */
export const INTRO_HOLD_MS = 1050
export const INTRO_REVEAL_MS = 450
export const INTRO_SKIP_MS = 200

const PAPER = '#FAFAF7'

export function Intro({
  name,
  onReveal,
  onDone,
}: {
  name: string
  /** Bắt đầu kéo màn — app bên dưới chạy scale/opacity cùng thời lượng. */
  onReveal: (durationMs: number) => void
  onDone: () => void
}) {
  const [revealMs, setRevealMs] = useState<number | null>(null)
  const started = useRef(false)
  const timers = useRef<number[]>([])

  const reveal = useCallback(
    (ms: number) => {
      if (started.current) return
      started.current = true
      setRevealMs(ms)
      onReveal(ms)
      timers.current.push(window.setTimeout(onDone, ms))
    },
    [onReveal, onDone],
  )

  useEffect(() => {
    const list = timers.current
    list.push(window.setTimeout(() => reveal(INTRO_REVEAL_MS), INTRO_HOLD_MS))
    return () => list.forEach((t) => window.clearTimeout(t))
  }, [reveal])

  const out = revealMs != null
  const outT = { duration: (revealMs ?? INTRO_REVEAL_MS) / 1000, ease: EASE }

  return (
    <motion.div
      role="presentation"
      aria-hidden
      onPointerDown={() => reveal(INTRO_SKIP_MS)}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'var(--accent)', pointerEvents: out ? 'none' : 'auto' }}
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      animate={{ clipPath: out ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)' }}
      transition={outT}
    >
      <motion.div
        className="flex flex-col items-center px-4"
        animate={out ? { y: -24, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={outT}
      >
        <div className="relative">
          <p className="flex text-[56px] leading-none font-bold tracking-[-0.03em]" style={{ color: PAPER }}>
            {name.split('').map((ch, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.07, ease: EASE }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
          </p>
          <motion.span
            className="absolute inset-x-0 -bottom-2 block h-[2px] origin-left"
            style={{ background: PAPER, opacity: 0.6 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.25, delay: 0.65, ease: EASE }}
          />
        </div>
        <motion.p
          className="mt-5 text-sm font-medium"
          style={{ color: PAPER }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.65, ease: EASE }}
        >
          Thẻ thành viên
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
