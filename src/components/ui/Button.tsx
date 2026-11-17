import { motion, type HTMLMotionProps } from 'motion/react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
  full?: boolean
}

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-white',
  secondary: 'bg-surface text-ink border border-line',
  danger: 'bg-surface text-danger border border-line',
}

export function Button({ variant = 'primary', full, className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-base font-semibold disabled:opacity-50 ${styles[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  )
}
