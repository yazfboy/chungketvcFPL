import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { formatNumber } from '../lib/format'

/** Số đếm tăng/giảm trong 400ms. Luôn chốt giá trị cuối bằng setTimeout (không kẹt nếu tab ẩn). */
export function CountUp({ value, ms = 400 }: { value: number; ms?: number }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    from.current = value
    if (reduce || start === value) {
      setShown(value)
      return
    }
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(Math.round(start + (value - start) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const done = window.setTimeout(() => setShown(value), ms + 50)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(done)
    }
  }, [value, ms, reduce])

  return <>{formatNumber(shown)}</>
}
