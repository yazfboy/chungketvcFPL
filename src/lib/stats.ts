import type { AppState, Member, Tier, Txn } from './types'
import { TIERS, getTier } from './rules'

export interface Stats {
  totalMembers: number
  /** Tổng điểm đã phát = tổng các giao dịch cộng điểm (gồm giao dịch mẫu). */
  pointsIssued: number
  /** Tổng điểm đã đổi = tổng điểm trừ ở các giao dịch đổi ưu đãi. */
  pointsRedeemed: number
  vouchersIssued: number
  vouchersUsed: number
  tierDistribution: { tier: Tier; count: number; pct: number }[]
  top: Member[]
  recent: Txn[]
}

/** Thống kê mini cho Quầy — tính hoàn toàn từ state (hàm thuần). */
export function computeStats(state: AppState, topN = 5, recentN = 8): Stats {
  const total = state.members.length
  const pointsIssued = state.txns.filter((t) => t.type === 'earn').reduce((s, t) => s + t.points, 0)
  const pointsRedeemed = state.txns.filter((t) => t.type === 'redeem').reduce((s, t) => s + Math.abs(t.points), 0)
  const counts = new Map<string, number>()
  for (const m of state.members) counts.set(getTier(m.points).id, (counts.get(getTier(m.points).id) ?? 0) + 1)
  return {
    totalMembers: total,
    pointsIssued,
    pointsRedeemed,
    vouchersIssued: state.vouchers.length,
    vouchersUsed: state.vouchers.filter((v) => v.status === 'da_dung').length,
    tierDistribution: TIERS.map((tier) => {
      const count = counts.get(tier.id) ?? 0
      return { tier, count, pct: total ? Math.round((count / total) * 100) : 0 }
    }),
    top: [...state.members].sort((a, b) => b.points - a.points || a.id.localeCompare(b.id)).slice(0, topN),
    recent: [...state.txns].sort((a, b) => b.at.localeCompare(a.at)).slice(0, recentN),
  }
}
