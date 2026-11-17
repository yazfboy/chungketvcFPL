/**
 * CỔNG PHÂN VAI MÔ PHỎNG cho bản demo web tĩnh — KHÔNG phải bảo mật thật.
 * Tài khoản demo công khai (admin / XSon), kiểm tra ngay trên trình duyệt.
 * Bản thật: xác thực phía server (mật khẩu băm, phiên/token có hạn, phân quyền theo cửa hàng).
 */
export const DEMO_USER = 'admin'
export const DEMO_PASS = 'XSon'

export function checkQuayLogin(user: string, pass: string): boolean {
  return user.trim().toLowerCase() === DEMO_USER && pass === DEMO_PASS
}
