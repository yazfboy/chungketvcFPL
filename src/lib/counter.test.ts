import { describe, expect, it } from 'vitest'
import { matchCounterInput, upsellHint } from './counter'
import { buildSampleState } from './seed'
import { register } from './rules'

describe('Quầy thông minh', () => {
  it('nhận mã, SĐT đầy đủ, 4 số cuối', () => {
    const s = buildSampleState()
    expect(matchCounterInput(s, 'kt-004').map((m) => m.id)).toEqual(['KT-004'])
    expect(matchCounterInput(s, '0900 001 004').map((m) => m.id)).toEqual(['KT-004'])
    expect(matchCounterInput(s, '1004').map((m) => m.id)).toEqual(['KT-004'])
    expect(matchCounterInput(s, '9999')).toEqual([])
    expect(matchCounterInput(s, '10')).toEqual([])
  })

  it('4 số cuối khớp nhiều người → trả cả danh sách', () => {
    const r = register(buildSampleState(), { name: 'Trùng Đuôi', phone: '0911111004' })
    if (!r.ok) throw new Error(r.error)
    expect(matchCounterInput(r.state, '1004').map((m) => m.id).sort()).toEqual(['KT-004', 'KT-009'])
  })

  it('gợi ý mua thêm khi còn < 30% khoảng lên hạng', () => {
    // Bạc 1.000–4.999: khoảng 4.000 điểm → gợi ý khi còn < 1.200 điểm
    expect(upsellHint(4820)).toEqual({ amount: 1_800_000, tier: expect.objectContaining({ id: 'vang' }) })
    expect(upsellHint(3200)).toBeNull()
    // Đồng 0–999: khoảng 1.000 → gợi ý khi còn < 300 điểm
    expect(upsellHint(982)?.amount).toBe(180_000)
    expect(upsellHint(12500)).toBeNull()
  })
})
