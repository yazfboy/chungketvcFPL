import { describe, expect, it } from 'vitest'
import { computeStats } from './stats'
import { buildSampleState } from './seed'
import { emptyState, redeem } from './rules'
import { runSelfCheck } from './selfcheck'

describe('Thống kê mini', () => {
  it('tính đúng trên dữ liệu mẫu BTC', () => {
    const s = computeStats(buildSampleState())
    expect(s.totalMembers).toBe(8)
    expect(s.pointsIssued).toBe(50 + 150 + 200 + 800 + 500 + 700)
    expect(s.pointsRedeemed).toBe(200)
    expect(s.tierDistribution.map((d) => [d.tier.id, d.count])).toEqual([
      ['dong', 3],
      ['bac', 3],
      ['vang', 2],
    ])
    expect(s.top.map((m) => m.id)).toEqual(['KT-006', 'KT-005', 'KT-007', 'KT-004', 'KT-002'])
    expect(s.recent).toHaveLength(7)
    expect(s.recent[0].txnCode).toBe('TX-KT-007')
  })

  it('đếm voucher và điểm đã đổi sau khi đổi quà', () => {
    const r = redeem(buildSampleState(), { memberId: 'KT-005', rewardId: 'KT-VCH-01' })
    if (!r.ok) throw new Error(r.error)
    const s = computeStats(r.state)
    expect([s.pointsRedeemed, s.vouchersIssued, s.vouchersUsed]).toEqual([700, 1, 0])
  })

  it('tự kiểm tra: cả 5 ca BTC đạt', () => {
    const results = runSelfCheck()
    expect(results.map((r) => [r.id, r.pass])).toEqual([
      ['TC-KT-01', true],
      ['TC-KT-02', true],
      ['TC-KT-03', true],
      ['TC-KT-04', true],
      ['TC-KT-05', true],
    ])
  })

  it('state rỗng không lỗi', () => {
    const s = computeStats(emptyState())
    expect(s.totalMembers).toBe(0)
    expect(s.tierDistribution.every((d) => d.pct === 0)).toBe(true)
  })
})
