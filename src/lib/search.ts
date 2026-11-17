import type { Member } from './types'
import { foldVietnamese } from './format'

/** Tìm theo tên (bỏ dấu), SĐT (chỉ so chữ số) hoặc mã thành viên. Chuỗi rỗng → tất cả. */
export function searchMembers(members: Member[], query: string): Member[] {
  const q = foldVietnamese(query)
  if (!q) return members
  const digits = query.replace(/\D/g, '')
  return members.filter(
    (m) =>
      foldVietnamese(m.name).includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (digits.length >= 3 && m.phone.includes(digits)),
  )
}
