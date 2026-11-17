export const EASE = [0.2, 0.8, 0.2, 1] as const

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: EASE },
}

/** Độ trễ stagger cho danh sách: 35ms, chỉ áp dụng 8 phần tử đầu. */
export function staggerDelay(index: number): number {
  return index < 8 ? index * 0.035 : 0
}
