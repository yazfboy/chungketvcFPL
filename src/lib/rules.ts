/**
 * QUY TẮC NGHIỆP VỤ — nguồn duy nhất. Trang Thể lệ đọc trực tiếp các hằng số ở đây.
 * Mọi hàm là hàm thuần: nhận state, trả {ok:true, state, ...} | {ok:false, error}. Không throw.
 */
import type { AppState, Member, Result, Reward, Tier, Txn, Voucher } from './types'
import { formatDateTime, formatNumber, formatVnd } from './format'
import uuDaiRows from '../data/KT_UuDai.json'

// ---------- Tỉ lệ tích điểm ----------
export const VND_PER_POINT = 10_000
export const MIN_AMOUNT = 10_000
export const MAX_AMOUNT = 1_000_000_000

/** Điểm = floor(số tiền / 10.000đ). */
export function pointsForAmount(amount: number): number {
  return Math.floor(amount / VND_PER_POINT)
}

/** null nếu hợp lệ, ngược lại là câu lỗi. */
export function validateAmount(amount: number | null | undefined): string | null {
  if (amount == null || !Number.isFinite(amount)) return 'Nhập số tiền giao dịch'
  if (!Number.isInteger(amount)) return 'Số tiền phải là số nguyên'
  if (amount < MIN_AMOUNT) return `Số tiền tối thiểu ${formatVnd(MIN_AMOUNT)}`
  if (amount > MAX_AMOUNT) return `Số tiền tối đa ${formatVnd(MAX_AMOUNT)}`
  return null
}

// ---------- Hạng (theo điểm hiện tại, khớp ngưỡng tham khảo của BTC) ----------
export const TIERS: readonly Tier[] = [
  { id: 'dong', name: 'Đồng', min: 0, color: '#8A5A3B' },
  { id: 'bac', name: 'Bạc', min: 1_000, color: '#6F7A86' },
  { id: 'vang', name: 'Vàng', min: 5_000, color: '#A9802A' },
]

export function getTier(points: number): Tier {
  let t = TIERS[0]
  for (const tier of TIERS) if (points >= tier.min) t = tier
  return t
}

/** Hạng kế tiếp và số điểm còn thiếu; null nếu đã hạng cao nhất. */
export function nextTier(points: number): { tier: Tier; remaining: number } | null {
  const next = TIERS.find((t) => t.min > points)
  return next ? { tier: next, remaining: next.min - points } : null
}

export function tierRank(t: Tier): number {
  return TIERS.findIndex((x) => x.id === t.id)
}

// ---------- Ưu đãi ----------
/** 3 ưu đãi từ sheet KT_UuDai (DiemCanDoi là chuỗi → ép số) + 1 ưu đãi riêng của đội. */
export const REWARDS: readonly Reward[] = [
  ...(uuDaiRows as Array<Record<string, string>>).map((r) => ({
    id: r.MaUuDai,
    name: r.TenUuDai,
    description: r.MoTa,
    cost: Number(String(r.DiemCanDoi).replace(/\D/g, '')) || 0,
    active: r.TrangThai === 'Đang áp dụng',
  })),
  {
    id: 'KT-VCH-VANG',
    name: 'Quà tri ân hạng Vàng',
    description: 'Chỉ dành cho thành viên hạng Vàng',
    cost: 3_000,
    active: true,
    goldOnly: true,
  },
]

/** Ngày công bố thể lệ (hiển thị ở trang Thể lệ). */
export const RULES_EFFECTIVE_FROM = '2026-11-17T00:00:00+07:00'

/** Thành viên có đổi được ưu đãi không, và lý do ngắn nếu không. */
export function rewardEligibility(points: number, reward: Reward): { ok: true } | { ok: false; reason: string } {
  if (!reward.active) return { ok: false, reason: 'Ngừng áp dụng' }
  if (reward.goldOnly && getTier(points).id !== 'vang') return { ok: false, reason: 'Dành cho hạng Vàng' }
  if (points < reward.cost) return { ok: false, reason: `Thiếu ${formatNumber(reward.cost - points)} điểm` }
  return { ok: true }
}

/**
 * Ưu đãi gần nhất cho khối gợi ý ở tab Thẻ:
 * - đủ điểm: ưu đãi giá trị cao nhất đang đổi được;
 * - chưa đủ: ưu đãi rẻ nhất chưa đổi được (kèm số điểm còn thiếu).
 */
export function nearestReward(
  rewards: readonly Reward[],
  points: number,
): { reward: Reward; affordable: true } | { reward: Reward; affordable: false; missing: number } | null {
  const usable = rewards.filter((r) => r.active && (!r.goldOnly || getTier(points).id === 'vang')).sort((a, b) => a.cost - b.cost)
  const affordable = usable.filter((r) => r.cost <= points)
  if (affordable.length) return { reward: affordable[affordable.length - 1], affordable: true }
  const next = usable[0]
  return next ? { reward: next, affordable: false, missing: next.cost - points } : null
}

/** Tiến độ trong khoảng của hạng hiện tại (0–1); null khi đã hạng cao nhất. */
export function tierProgress(points: number): number | null {
  const next = nextTier(points)
  if (!next) return null
  const cur = getTier(points)
  return Math.min(1, Math.max(0, (points - cur.min) / (next.tier.min - cur.min)))
}

// ---------- Chuẩn hoá ----------
/** Mã giao dịch: trim, gộp khoảng trắng, IN HOA. */
export function normalizeTxnCode(code: string): string {
  return code.trim().replace(/\s+/g, ' ').toUpperCase()
}

/** Mã thành viên: trim, IN HOA (không phân biệt hoa/thường). */
export function normalizeMemberId(id: string): string {
  return id.trim().toUpperCase()
}

/** SĐT: bỏ khoảng trắng, dấu chấm, gạch ngang. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s.-]/g, '')
}

export function isValidPhone(phone: string): boolean {
  return /^0\d{9}$/.test(normalizePhone(phone))
}

// ---------- Tra cứu ----------
export function emptyState(): AppState {
  return { version: 1, members: [], txns: [], vouchers: [], rewards: [...REWARDS], usedTxnCodes: {}, isSample: false }
}

export function findMember(state: AppState, id: string): Member | undefined {
  const key = normalizeMemberId(id)
  return state.members.find((m) => m.id === key)
}

/** Mở thẻ bằng mã thành viên hoặc SĐT (bỏ khoảng trắng/dấu chấm). */
export function findMemberByIdOrPhone(state: AppState, query: string): Member | undefined {
  const byId = findMember(state, query)
  if (byId) return byId
  const phone = normalizePhone(query)
  return /^\d{9,11}$/.test(phone) ? state.members.find((m) => m.phone === phone) : undefined
}

export function findReward(state: AppState, id: string): Reward | undefined {
  return state.rewards.find((r) => r.id === id)
}

export function memberTxns(state: AppState, memberId: string): Txn[] {
  return state.txns.filter((t) => t.memberId === memberId).sort((a, b) => b.at.localeCompare(a.at))
}

export function txnCodeUsage(state: AppState, code: string): { memberId: string; at: string } | undefined {
  const key = normalizeTxnCode(code)
  return key ? state.usedTxnCodes[key] : undefined
}

export function duplicateTxnMessage(code: string, used: { memberId: string; at: string }): string {
  return `Mã giao dịch ${normalizeTxnCode(code)} đã được cộng lúc ${formatDateTime(used.at)} cho ${used.memberId} — không cộng thêm`
}

// ---------- Sinh mã ----------
export type Ctx = { now?: Date; random?: () => number }
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomChars(n: number, random: () => number): string {
  let s = ''
  for (let i = 0; i < n; i++) s += ALPHABET[Math.floor(random() * ALPHABET.length) % ALPHABET.length]
  return s
}

function newId(now: Date, random: () => number): string {
  return `T-${now.getTime().toString(36)}-${randomChars(4, random)}`
}

/** Mã giao dịch tự sinh: TX-yyMMdd-xxxx (không trùng sổ hiện có). */
export function generateTxnCode(state: AppState, ctx: Ctx = {}): string {
  const now = ctx.now ?? new Date()
  const random = ctx.random ?? Math.random
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = `${pad(now.getFullYear() % 100)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  for (let i = 0; i < 50; i++) {
    const code = `TX-${day}-${randomChars(4, random)}`
    if (!state.usedTxnCodes[code]) return code
  }
  return `TX-${day}-${now.getTime().toString(36).toUpperCase()}`
}

function generateVoucherCode(state: AppState, random: () => number): string {
  const used = new Set(state.vouchers.map((v) => v.code))
  for (let i = 0; i < 100; i++) {
    const code = `TEM-${randomChars(4, random)}-${randomChars(4, random)}`
    if (!used.has(code)) return code
  }
  return `TEM-${Date.now().toString(36).toUpperCase()}`
}

/** Mã thành viên mới = KT-xxx với số lớn nhất hiện có + 1 (pad 3) → luôn duy nhất. */
export function nextMemberId(state: AppState): string {
  const max = state.members.reduce((acc, m) => {
    const n = /^KT-(\d+)$/.exec(m.id)
    return n ? Math.max(acc, Number(n[1])) : acc
  }, 0)
  return `KT-${String(max + 1).padStart(3, '0')}`
}

function replaceMember(state: AppState, member: Member): Member[] {
  return state.members.map((m) => (m.id === member.id ? member : m))
}

// ---------- Cộng điểm ----------
export function earnPoints(
  state: AppState,
  input: { memberId: string; amount: number | null; txnCode: string },
  ctx: Ctx = {},
): Result<{ pointsAdded: number; oldTier: Tier; newTier: Tier; member: Member; txn: Txn }> {
  const member = findMember(state, input.memberId)
  if (!member) return { ok: false, error: `Không tìm thấy thành viên ${normalizeMemberId(input.memberId)}`.trim() }
  const amountError = validateAmount(input.amount)
  if (amountError || input.amount == null) return { ok: false, error: amountError ?? 'Số tiền không hợp lệ' }
  const code = normalizeTxnCode(input.txnCode)
  if (!code) return { ok: false, error: 'Nhập mã giao dịch' }
  if (code.length > 40) return { ok: false, error: 'Mã giao dịch tối đa 40 ký tự' }
  const used = state.usedTxnCodes[code]
  if (used) return { ok: false, error: duplicateTxnMessage(code, used) }

  const now = ctx.now ?? new Date()
  const random = ctx.random ?? Math.random
  const at = now.toISOString()
  const pointsAdded = pointsForAmount(input.amount)
  const oldTier = getTier(member.points)
  const updated: Member = { ...member, points: member.points + pointsAdded }
  const txn: Txn = {
    id: newId(now, random),
    memberId: member.id,
    type: 'earn',
    points: pointsAdded,
    balanceAfter: updated.points,
    amount: input.amount,
    txnCode: code,
    at,
  }
  return {
    ok: true,
    state: {
      ...state,
      members: replaceMember(state, updated),
      txns: [...state.txns, txn],
      usedTxnCodes: { ...state.usedTxnCodes, [code]: { memberId: member.id, at } },
    },
    pointsAdded,
    oldTier,
    newTier: getTier(updated.points),
    member: updated,
    txn,
  }
}

// ---------- Đổi ưu đãi ----------
type RedeemCheck = { ok: true; member: Member; reward: Reward } | { ok: false; error: string }

function checkRedeem(state: AppState, input: { memberId: string; rewardId: string }): RedeemCheck {
  const member = findMember(state, input.memberId)
  if (!member) return { ok: false, error: 'Không tìm thấy thành viên' }
  const reward = findReward(state, input.rewardId)
  if (!reward) return { ok: false, error: 'Không tìm thấy ưu đãi' }
  if (!reward.active) return { ok: false, error: 'Ưu đãi này đã ngừng áp dụng' }
  if (reward.goldOnly && getTier(member.points).id !== 'vang') return { ok: false, error: 'Ưu đãi này chỉ dành cho hạng Vàng' }
  if (member.points < reward.cost)
    return { ok: false, error: `Chưa đủ điểm: cần ${formatNumber(reward.cost)}, hiện có ${formatNumber(member.points)}` }
  return { ok: true, member, reward }
}

/** Xem trước cho màn xác nhận đổi quà: số dư sau, hạng sau, có tụt hạng không. */
export function previewRedeem(
  state: AppState,
  input: { memberId: string; rewardId: string },
): { ok: true; balanceAfter: number; tierBefore: Tier; tierAfter: Tier; tierDrops: boolean } | { ok: false; error: string } {
  const c = checkRedeem(state, input)
  if (!c.ok) return c
  const balanceAfter = c.member.points - c.reward.cost
  const tierBefore = getTier(c.member.points)
  const tierAfter = getTier(balanceAfter)
  return { ok: true, balanceAfter, tierBefore, tierAfter, tierDrops: tierRank(tierAfter) < tierRank(tierBefore) }
}

export function redeem(
  state: AppState,
  input: { memberId: string; rewardId: string },
  ctx: Ctx = {},
): Result<{ oldTier: Tier; newTier: Tier; voucher: Voucher; member: Member }> {
  const c = checkRedeem(state, input)
  if (!c.ok) return c
  const now = ctx.now ?? new Date()
  const random = ctx.random ?? Math.random
  const at = now.toISOString()
  const updated: Member = { ...c.member, points: c.member.points - c.reward.cost }
  const voucher: Voucher = {
    code: generateVoucherCode(state, random),
    memberId: c.member.id,
    rewardId: c.reward.id,
    status: 'chua_dung',
    createdAt: at,
  }
  const txn: Txn = {
    id: newId(now, random),
    memberId: c.member.id,
    type: 'redeem',
    points: -c.reward.cost,
    balanceAfter: updated.points,
    rewardId: c.reward.id,
    voucherCode: voucher.code,
    at,
    note: c.reward.name,
  }
  return {
    ok: true,
    state: { ...state, members: replaceMember(state, updated), txns: [...state.txns, txn], vouchers: [...state.vouchers, voucher] },
    oldTier: getTier(c.member.points),
    newTier: getTier(updated.points),
    voucher,
    member: updated,
  }
}

// ---------- Dùng voucher (Quầy) ----------
export function useVoucher(
  state: AppState,
  code: string,
  ctx: Ctx = {},
): Result<{ voucher: Voucher; member?: Member; reward?: Reward }> {
  const key = code.trim().toUpperCase()
  if (!key) return { ok: false, error: 'Nhập mã voucher' }
  const voucher = state.vouchers.find((v) => v.code === key)
  if (!voucher) return { ok: false, error: `Không tìm thấy voucher ${key}` }
  if (voucher.status === 'da_dung')
    return { ok: false, error: `Voucher ${key} đã dùng lúc ${voucher.usedAt ? formatDateTime(voucher.usedAt) : '—'}` }
  const now = ctx.now ?? new Date()
  const random = ctx.random ?? Math.random
  const at = now.toISOString()
  const member = state.members.find((m) => m.id === voucher.memberId)
  const reward = findReward(state, voucher.rewardId)
  const used: Voucher = { ...voucher, status: 'da_dung', usedAt: at }
  const txn: Txn = {
    id: newId(now, random),
    memberId: voucher.memberId,
    type: 'use_voucher',
    points: 0,
    balanceAfter: member?.points ?? 0,
    rewardId: voucher.rewardId,
    voucherCode: key,
    at,
    note: reward?.name,
  }
  return {
    ok: true,
    state: { ...state, vouchers: state.vouchers.map((v) => (v.code === key ? used : v)), txns: [...state.txns, txn] },
    voucher: used,
    member,
    reward,
  }
}

// ---------- Đăng ký ----------
export function register(state: AppState, input: { name: string; phone: string }, ctx: Ctx = {}): Result<{ member: Member }> {
  const name = input.name.trim().replace(/\s+/g, ' ')
  if (!name) return { ok: false, error: 'Nhập họ tên' }
  if (name.length > 60) return { ok: false, error: 'Họ tên tối đa 60 ký tự' }
  const phone = normalizePhone(input.phone)
  if (!/^0\d{9}$/.test(phone)) return { ok: false, error: 'Số điện thoại cần đủ 10 số, bắt đầu bằng 0' }
  const dup = state.members.find((m) => m.phone === phone)
  if (dup) return { ok: false, error: `SĐT này đã là thành viên ${dup.id}` }
  const member: Member = {
    id: nextMemberId(state),
    name,
    phone,
    points: 0,
    joinedAt: (ctx.now ?? new Date()).toISOString(),
    status: 'Đang hoạt động',
    source: 'moi',
  }
  return { ok: true, state: { ...state, members: [...state.members, member] }, member }
}
