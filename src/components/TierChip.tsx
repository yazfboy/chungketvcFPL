import type { Tier } from '../lib/types'

/** Chip hạng — nền đặc màu hạng, chữ trắng (ngoại lệ màu theo CLAUDE.md mục 10). */
export function TierChip({ tier, className = '' }: { tier: Tier; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold text-white ${className}`}
      style={{ background: tier.color }}
    >
      {tier.name}
    </span>
  )
}
