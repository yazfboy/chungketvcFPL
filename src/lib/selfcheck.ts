/**
 * Tự kiểm tra 5 ca KT_CaKiemTra bằng chính rules.ts, trên BẢN SAO buildSampleState()
 * (mỗi ca một bản sao mới) — không đụng dữ liệu thật của người dùng.
 * Đầu vào (mã TV, mã GD/ưu đãi, số tiền) đọc từ file BTC qua TEST_CASES.
 */
import { earnPoints, findMember, getTier, redeem } from './rules'
import { TEST_CASES, buildSampleState, type TestCase } from './seed'
import { formatNumber } from './format'

export interface CheckResult {
  id: string
  situation: string
  expected: string
  actual: string
  pass: boolean
}

function check(tc: TestCase): { actual: string; pass: boolean } {
  const s = buildSampleState()
  const before = findMember(s, tc.memberId)?.points ?? NaN

  switch (tc.id) {
    case 'TC-KT-01': {
      const r = earnPoints(s, { memberId: tc.memberId, amount: tc.amount, txnCode: tc.ref })
      if (!r.ok) return { actual: `Lỗi: ${r.error}`, pass: false }
      const again = earnPoints(r.state, { memberId: tc.memberId, amount: tc.amount, txnCode: tc.ref })
      const after = r.member.points
      return {
        actual: `Cộng +${formatNumber(r.pointsAdded)}, số dư ${formatNumber(before)} → ${formatNumber(after)}; nhập lại bị chặn: ${again.ok ? 'không' : 'có'}`,
        pass: r.pointsAdded === 100 && before === 0 && after === 100 && !again.ok,
      }
    }
    case 'TC-KT-02': {
      const r = earnPoints(s, { memberId: tc.memberId, amount: tc.amount, txnCode: tc.ref })
      const after = findMember(s, tc.memberId)?.points
      return {
        actual: r.ok ? `Đã cộng +${r.pointsAdded} (sai)` : `${r.error}. Điểm giữ ${formatNumber(after ?? NaN)}`,
        pass: !r.ok && after === before && before === 1450,
      }
    }
    case 'TC-KT-03': {
      const r = redeem(s, { memberId: tc.memberId, rewardId: tc.ref })
      if (!r.ok) return { actual: `Lỗi: ${r.error}`, pass: false }
      const inWallet = r.state.vouchers.some((v) => v.code === r.voucher.code && v.memberId === tc.memberId)
      return {
        actual: `Số dư ${formatNumber(before)} → ${formatNumber(r.member.points)}, voucher ${r.voucher.code} trong ví`,
        pass: before === 5800 && r.member.points === 5300 && inWallet,
      }
    }
    case 'TC-KT-04': {
      const r = redeem(s, { memberId: tc.memberId, rewardId: tc.ref })
      const after = findMember(s, tc.memberId)?.points
      return {
        actual: r.ok ? 'Đã đổi (sai)' : `Từ chối: ${r.error}. Số dư vẫn ${formatNumber(after ?? NaN)}`,
        pass: !r.ok && after === 0 && s.vouchers.length === 0,
      }
    }
    case 'TC-KT-05': {
      const m = findMember(s, tc.ref)
      return {
        actual: m ? `Payload ${tc.ref} → mở hồ sơ ${m.name}, hạng ${getTier(m.points).name}` : `Không tìm thấy ${tc.ref}`,
        pass: m?.name === 'Dũng Phạm' && getTier(m.points).name === 'Bạc',
      }
    }
    default:
      return { actual: 'Chưa có kịch bản tự động cho ca này', pass: false }
  }
}

export function runSelfCheck(): CheckResult[] {
  return TEST_CASES.map((tc) => {
    try {
      return { id: tc.id, situation: tc.situation, expected: tc.expected, ...check(tc) }
    } catch (e) {
      return { id: tc.id, situation: tc.situation, expected: tc.expected, actual: `Lỗi khi chạy: ${String(e)}`, pass: false }
    }
  })
}
