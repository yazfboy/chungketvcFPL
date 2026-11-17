/** Logic thuần cho "Quầy thông minh". */
import type { AppState, Member, Tier } from './types'
import { VND_PER_POINT, findMember, getTier, nextTier, normalizePhone } from './rules'

/**
 * Ô mã thành viên ở Quầy nhận: mã KT-xxx, SĐT đầy đủ, hoặc 4 số cuối SĐT.
 * Trả về danh sách khớp (1 → chọn luôn; nhiều → cho chọn nhanh; 0 → không tìm thấy).
 */
export function matchCounterInput(state: AppState, input: string): Member[] {
  const raw = input.trim()
  if (!raw) return []
  const byId = findMember(state, raw)
  if (byId) return [byId]
  const digits = normalizePhone(raw)
  if (!/^\d+$/.test(digits)) return []
  if (digits.length === 10) return state.members.filter((m) => m.phone === digits)
  if (digits.length === 4) return state.members.filter((m) => m.phone.endsWith(digits))
  return []
}

/** Ngưỡng gợi ý: còn dưới 30% khoảng điểm của hạng hiện tại để lên hạng kế. */
export const UPSELL_THRESHOLD = 0.3

/**
 * Gợi ý "Mua thêm X đ để lên hạng Y" khi khách (sau giao dịch đang nhập) còn < 30% khoảng để lên hạng.
 * Số tiền = số điểm còn thiếu × 10.000đ (một hoá đơn riêng, làm tròn xuống theo thể lệ).
 */
export function upsellHint(pointsAfter: number): { amount: number; tier: Tier } | null {
  const next = nextTier(pointsAfter)
  if (!next) return null
  const cur = getTier(pointsAfter)
  const range = next.tier.min - cur.min
  if (next.remaining <= 0 || next.remaining / range >= UPSELL_THRESHOLD) return null
  return { amount: next.remaining * VND_PER_POINT, tier: next.tier }
}
