/**
 * Nạp dữ liệu mẫu BTC (data/mau.xlsx → src/data/*.json bằng scripts/xlsx-to-json.mjs).
 *
 * MAPPING CỘT:
 *  KT_ThanhVien → Member
 *    MaThanhVien → id · HoTen_Mau → name · DienThoai_GiaLap → phone (chuỗi, bù số 0 đầu nếu mất)
 *    DiemHienTai → points (ĐÃ gồm giao dịch mẫu — KHÔNG cộng lại) · TrangThai → status
 *    NgayThamGia "yyyy-MM-dd" (giờ VN) → joinedAt ISO · source = 'mau'
 *    DiemDauKy, HangMauThamKhao, MaQR_Payload: chỉ để đối chiếu (hạng do getTier tính; QR payload = id).
 *  KT_GiaoDich → Txn (lịch sử) — KT_LichSuDiem trùng thông tin nên không dùng.
 *    MaGiaoDich → txnCode (+ id) · LoaiBienDong "Cộng điểm"→earn, "Đổi ưu đãi"→redeem
 *    MaThanhVien → memberId · ThoiGian "yyyy-MM-dd HH:mm" (+07:00) → at ISO
 *    GiaTriGiaoDich_VND → amount (bỏ nếu 0) · ThayDoiDiem → points (có dấu)
 *    SoDuSauGiaoDich → balanceAfter · GhiChu → note · sample = true
 *    Mọi MaGiaoDich mẫu (TX-KT-001..007) được đăng ký vào usedTxnCodes để chống trùng.
 *  KT_UuDai → Reward: xem REWARDS trong rules.ts (DiemCanDoi chuỗi → số).
 *  KT_CaKiemTra → TEST_CASES (trang Dữ liệu + unit test).
 *  KT_MaQR: payload = MaThanhVien, app tự sinh QR, không cần ảnh.
 */
import type { AppState, Member, Txn } from './types'
import { REWARDS, normalizeTxnCode } from './rules'
import thanhVienRows from '../data/KT_ThanhVien.json'
import giaoDichRows from '../data/KT_GiaoDich.json'
import caKiemTraRows from '../data/KT_CaKiemTra.json'

type Row = Record<string, string>

const num = (v: string | undefined): number => {
  const n = Number(String(v ?? '').replace(/[^\d-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** "2026-10-04 11:40" hoặc "2026-10-04" (giờ Việt Nam) → ISO string. Sai định dạng → thời điểm hiện tại. */
export function vnLocalToIso(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(s).trim())
  if (!m) return new Date().toISOString()
  const [, y, mo, d, h = '00', mi = '00'] = m
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+07:00`)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function normalizeSamplePhone(p: string): string {
  const digits = String(p).replace(/\D/g, '')
  return digits.length === 9 ? `0${digits}` : digits
}

export const SAMPLE_MEMBER_COUNT = (thanhVienRows as Row[]).length
export const SAMPLE_TEST_ID = 'KT-004'

export function buildSampleState(): AppState {
  const members: Member[] = (thanhVienRows as Row[]).map((r) => ({
    id: r.MaThanhVien.trim().toUpperCase(),
    name: r.HoTen_Mau.trim(),
    phone: normalizeSamplePhone(r.DienThoai_GiaLap),
    points: num(r.DiemHienTai),
    joinedAt: vnLocalToIso(r.NgayThamGia),
    status: r.TrangThai || 'Đang hoạt động',
    source: 'mau',
  }))

  const txns: Txn[] = (giaoDichRows as Row[]).map((r) => {
    const amount = num(r.GiaTriGiaoDich_VND)
    const code = normalizeTxnCode(r.MaGiaoDich)
    return {
      id: code,
      memberId: r.MaThanhVien.trim().toUpperCase(),
      type: r.LoaiBienDong.trim() === 'Cộng điểm' ? 'earn' : 'redeem',
      points: num(r.ThayDoiDiem),
      balanceAfter: num(r.SoDuSauGiaoDich),
      ...(amount > 0 ? { amount } : {}),
      txnCode: code,
      at: vnLocalToIso(r.ThoiGian),
      note: r.GhiChu || undefined,
      sample: true,
    }
  })

  const usedTxnCodes: AppState['usedTxnCodes'] = {}
  for (const t of txns) if (t.txnCode) usedTxnCodes[t.txnCode] = { memberId: t.memberId, at: t.at }

  return { version: 1, members, txns, vouchers: [], rewards: [...REWARDS], usedTxnCodes, isSample: true }
}

/** Hạng tham khảo trong file BTC — dùng để đối chiếu trong test. */
export const SAMPLE_REFERENCE_TIERS: Record<string, string> = Object.fromEntries(
  (thanhVienRows as Row[]).map((r) => [r.MaThanhVien, r.HangMauThamKhao]),
)

export interface TestCase {
  id: string
  situation: string
  memberId: string
  ref: string
  amount: number | null
  input: string
  expected: string
}

export const TEST_CASES: TestCase[] = (caKiemTraRows as Row[]).map((r) => ({
  id: r.MaCa,
  situation: r.TinhHuong,
  memberId: r.MaThanhVien,
  ref: r.MaGiaoDich_HoacUuDai,
  amount: r.GiaTriGiaoDich_VND ? num(r.GiaTriGiaoDich_VND) : null,
  input: r.DuLieuDauVao,
  expected: r.KetQuaMongDoi,
}))
