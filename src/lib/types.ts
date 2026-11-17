/** Mô hình dữ liệu dùng chung. Mọi thời gian (`at`, `createdAt`, `usedAt`, `joinedAt`) là ISO string. */

export type TierId = 'dong' | 'bac' | 'vang'

export interface Tier {
  id: TierId
  name: string
  /** Điểm tối thiểu để đạt hạng (tính theo điểm hiện tại). */
  min: number
  /** Màu hạng — ngoại lệ màu theo CLAUDE.md mục 10. */
  color: string
}

/** Thành viên — chỉ có MỘT loại điểm duy nhất (`points`). */
export interface Member {
  id: string
  name: string
  phone: string
  points: number
  joinedAt: string
  status: string
  source: 'mau' | 'moi'
}

export type TxnType = 'earn' | 'redeem' | 'use_voucher'

export interface Txn {
  id: string
  memberId: string
  type: TxnType
  /** Có dấu: dương khi cộng, âm khi đổi. */
  points: number
  balanceAfter: number
  amount?: number
  txnCode?: string
  rewardId?: string
  voucherCode?: string
  at: string
  note?: string
  /** true với giao dịch nạp từ file mẫu BTC. */
  sample?: boolean
}

export interface Voucher {
  code: string
  memberId: string
  rewardId: string
  status: 'chua_dung' | 'da_dung'
  createdAt: string
  usedAt?: string
}

export interface Reward {
  id: string
  name: string
  description: string
  cost: number
  active: boolean
  goldOnly?: boolean
}

export interface AppState {
  version: 1
  members: Member[]
  txns: Txn[]
  vouchers: Voucher[]
  rewards: Reward[]
  /** Sổ mã giao dịch đã cộng — khoá là mã đã chuẩn hoá. Chống trùng toàn hệ thống. */
  usedTxnCodes: Record<string, { memberId: string; at: string }>
  isSample: boolean
}

/** Kết quả mọi thao tác nghiệp vụ: không throw, trả lỗi tiếng Việt. */
export type Result<T extends object = object> = ({ ok: true; state: AppState } & T) | { ok: false; error: string }
