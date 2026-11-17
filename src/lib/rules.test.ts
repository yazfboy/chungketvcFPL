import { describe, expect, it } from 'vitest'
import {
  earnPoints,
  emptyState,
  findMember,
  getTier,
  nextTier,
  normalizeTxnCode,
  previewRedeem,
  redeem,
  register,
  useVoucher,
} from './rules'
import { SAMPLE_REFERENCE_TIERS, TEST_CASES, buildSampleState } from './seed'
import { formatDateTime } from './format'

const NOW = new Date('2026-11-17T08:00:00+07:00')
const ctx = { now: NOW, random: () => 0.42 }
const points = (s: ReturnType<typeof buildSampleState>, id: string) => findMember(s, id)?.points

describe('Ca kiểm tra BTC (KT_CaKiemTra)', () => {
  it('đủ 5 ca trong file mẫu', () => {
    expect(TEST_CASES.map((c) => c.id)).toEqual(['TC-KT-01', 'TC-KT-02', 'TC-KT-03', 'TC-KT-04', 'TC-KT-05'])
  })

  it('TC-KT-01: KT-008 + 1.000.000đ mã TX-NEW-001 → +100, số dư 0 → 100', () => {
    const s = buildSampleState()
    expect(points(s, 'KT-008')).toBe(0)
    const r = earnPoints(s, { memberId: 'KT-008', amount: 1_000_000, txnCode: 'TX-NEW-001' }, ctx)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.pointsAdded).toBe(100)
    expect(points(r.state, 'KT-008')).toBe(100)
    expect(r.txn.balanceAfter).toBe(100)
    // cộng một lần: nhập lại cùng mã bị chặn
    const again = earnPoints(r.state, { memberId: 'KT-008', amount: 1_000_000, txnCode: 'TX-NEW-001' }, ctx)
    expect(again.ok).toBe(false)
  })

  it('TC-KT-02: KT-002 nhập lại TX-KT-002 → báo trùng, điểm giữ 1.450', () => {
    const s = buildSampleState()
    for (const code of ['TX-KT-002', ' tx-kt-002 ']) {
      const r = earnPoints(s, { memberId: 'KT-002', amount: 1_500_000, txnCode: code }, ctx)
      expect(r.ok).toBe(false)
      if (r.ok) return
      expect(r.error).toContain('TX-KT-002')
      expect(r.error).toContain('KT-002')
      expect(r.error).toContain('không cộng thêm')
      expect(r.error).not.toContain('Invalid Date')
      expect(r.error).not.toContain('NaN')
    }
    expect(points(s, 'KT-002')).toBe(1450)
  })

  it('TC-KT-03: KT-005 đổi KT-VCH-01 → 5.800 còn 5.300, có voucher trong ví', () => {
    const s = buildSampleState()
    const r = redeem(s, { memberId: 'KT-005', rewardId: 'KT-VCH-01' }, ctx)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(points(r.state, 'KT-005')).toBe(5300)
    const wallet = r.state.vouchers.filter((v) => v.memberId === 'KT-005')
    expect(wallet).toHaveLength(1)
    expect(wallet[0].status).toBe('chua_dung')
    expect(wallet[0].code).toMatch(/^TEM-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })

  it('TC-KT-04: KT-008 đổi KT-VCH-01 → từ chối, số dư vẫn 0', () => {
    const s = buildSampleState()
    const r = redeem(s, { memberId: 'KT-008', rewardId: 'KT-VCH-01' }, ctx)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toBe('Chưa đủ điểm: cần 500, hiện có 0')
    expect(points(s, 'KT-008')).toBe(0)
    expect(s.vouchers).toHaveLength(0)
  })

  it('TC-KT-05: tra mã "KT-004" → Dũng Phạm, hạng Bạc', () => {
    const s = buildSampleState()
    for (const q of ['KT-004', ' kt-004 ']) {
      const m = findMember(s, q)
      expect(m?.name).toBe('Dũng Phạm')
      expect(getTier(m?.points ?? -1).name).toBe('Bạc')
    }
  })
})

describe('Dữ liệu mẫu', () => {
  it('nạp mẫu ra đúng hạng tham chiếu cả 8 người, không cộng lại giao dịch', () => {
    const s = buildSampleState()
    expect(s.members).toHaveLength(8)
    for (const m of s.members) expect(getTier(m.points).name).toBe(SAMPLE_REFERENCE_TIERS[m.id])
    expect(points(s, 'KT-006')).toBe(12500)
    expect(s.txns).toHaveLength(7)
    expect(Object.keys(s.usedTxnCodes).sort()).toEqual(
      ['TX-KT-001', 'TX-KT-002', 'TX-KT-003', 'TX-KT-004', 'TX-KT-005', 'TX-KT-006', 'TX-KT-007'],
    )
    expect(s.isSample).toBe(true)
  })

  it('giữ số 0 đầu SĐT và thời gian là ISO hợp lệ', () => {
    const s = buildSampleState()
    expect(findMember(s, 'KT-001')?.phone).toBe('0900001001')
    for (const t of s.txns) expect(formatDateTime(t.at)).not.toBe('—')
    const tx2 = s.txns.find((t) => t.txnCode === 'TX-KT-002')
    expect(tx2 && formatDateTime(tx2.at)).toBe('11:40 04/10/2026')
  })
})

describe('Quy tắc', () => {
  it('mốc hạng: 999 Đồng, 1.000 Bạc, 4.999 Bạc, 5.000 Vàng', () => {
    expect(getTier(999).id).toBe('dong')
    expect(getTier(1000).id).toBe('bac')
    expect(getTier(4999).id).toBe('bac')
    expect(getTier(5000).id).toBe('vang')
    expect(nextTier(800)).toEqual({ tier: getTier(1000), remaining: 200 })
    expect(nextTier(5000)).toBeNull()
  })

  it('lên hạng Đồng → Bạc khi cộng điểm', () => {
    const s = buildSampleState()
    const r = earnPoints(s, { memberId: 'KT-003', amount: 2_000_000, txnCode: 'TX-UP-1' }, ctx)
    expect(r.ok && [r.oldTier.id, r.newTier.id]).toEqual(['dong', 'bac'])
  })

  it('số tiền lẻ làm tròn xuống, số tiền ngoài giới hạn bị từ chối', () => {
    const s = buildSampleState()
    const r = earnPoints(s, { memberId: 'KT-001', amount: 19_999, txnCode: 'A1' }, ctx)
    expect(r.ok && r.pointsAdded).toBe(1)
    expect(earnPoints(s, { memberId: 'KT-001', amount: 9_999, txnCode: 'A2' }, ctx).ok).toBe(false)
    expect(earnPoints(s, { memberId: 'KT-001', amount: 1_000_000_001, txnCode: 'A3' }, ctx).ok).toBe(false)
    expect(earnPoints(s, { memberId: 'KT-999', amount: 100_000, txnCode: 'A4' }, ctx).ok).toBe(false)
  })

  it('chuẩn hoá mã giao dịch', () => {
    expect(normalizeTxnCode('  tx  new   001 ')).toBe('TX NEW 001')
  })

  it('đổi quà làm tụt hạng: KT-005 (5.800, Vàng) đổi 1.100 → Bạc', () => {
    const s = buildSampleState()
    const p = previewRedeem(s, { memberId: 'KT-005', rewardId: 'KT-VCH-02' })
    expect(p.ok && [p.balanceAfter, p.tierAfter.id, p.tierDrops]).toEqual([4700, 'bac', true])
    const p2 = previewRedeem(s, { memberId: 'KT-006', rewardId: 'KT-VCH-01' })
    expect(p2.ok && p2.tierDrops).toBe(false)
  })

  it('ưu đãi chỉ dành hạng Vàng từ chối hạng Bạc', () => {
    const s = buildSampleState()
    expect(redeem(s, { memberId: 'KT-004', rewardId: 'KT-VCH-VANG' }, ctx).ok).toBe(false)
    expect(redeem(s, { memberId: 'KT-006', rewardId: 'KT-VCH-VANG' }, ctx).ok).toBe(true)
  })

  it('dùng voucher một lần', () => {
    const s = buildSampleState()
    const r = redeem(s, { memberId: 'KT-005', rewardId: 'KT-VCH-01' }, ctx)
    if (!r.ok) throw new Error(r.error)
    const u = useVoucher(r.state, r.voucher.code.toLowerCase(), ctx)
    expect(u.ok && u.voucher.status).toBe('da_dung')
    if (!u.ok) return
    expect(useVoucher(u.state, r.voucher.code, ctx).ok).toBe(false)
  })

  it('đăng ký: mã mới KT-009, chặn SĐT trùng, SĐT sai', () => {
    const s = buildSampleState()
    const r = register(s, { name: '  Lan  Phạm ', phone: '0912.345 678' }, ctx)
    expect(r.ok && [r.member.id, r.member.name, r.member.phone]).toEqual(['KT-009', 'Lan Phạm', '0912345678'])
    const dup = register(s, { name: 'X', phone: '0900 001 004' }, ctx)
    expect(dup.ok ? '' : dup.error).toBe('SĐT này đã là thành viên KT-004')
    expect(register(s, { name: 'X', phone: '912345678' }, ctx).ok).toBe(false)
    expect(register(emptyState(), { name: 'A', phone: '0911111111' }, ctx).ok && 'KT-001').toBe('KT-001')
  })
})
