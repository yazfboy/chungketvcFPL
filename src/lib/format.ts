const TZ = 'Asia/Ho_Chi_Minh'

const dtFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** Hàm DUY NHẤT hiển thị thời gian: ISO → "HH:mm dd/MM/yyyy" (giờ Việt Nam). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = Object.fromEntries(dtFormatter.formatToParts(d).map((x) => [x.type, x.value]))
  const hour = p.hour === '24' ? '00' : p.hour
  return `${hour}:${p.minute} ${p.day}/${p.month}/${p.year}`
}

/** "HH:mm" (giờ Việt Nam) — phần giờ của formatDateTime. */
export function formatTime(iso: string): string {
  const full = formatDateTime(iso)
  return full === '—' ? full : full.slice(0, 5)
}

/** Khoá ngày "yyyy-MM-dd" theo giờ Việt Nam, để nhóm lịch sử. */
export function vnDayKey(iso: string | Date): string {
  const full = formatDateTime(typeof iso === 'string' ? iso : iso.toISOString())
  if (full === '—') return ''
  const [d, m, y] = full.slice(6).split('/')
  return `${y}-${m}-${d}`
}

/** Nhãn nhóm ngày: "Hôm nay" / "Hôm qua" / "dd/MM/yyyy". */
export function formatDayLabel(dayKey: string, now: Date = new Date()): string {
  if (!dayKey) return '—'
  const today = vnDayKey(now)
  const yesterday = vnDayKey(new Date(now.getTime() - 86_400_000))
  if (dayKey === today) return 'Hôm nay'
  if (dayKey === yesterday) return 'Hôm qua'
  const [y, m, d] = dayKey.split('-')
  return `${d}/${m}/${y}`
}

/** "dd/MM/yyyy" (giờ Việt Nam). */
export function formatDate(iso: string): string {
  const full = formatDateTime(iso)
  return full === '—' ? full : full.slice(6)
}

/** 1000000 → "1.000.000" (dấu chấm phân tách nghìn). */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0'
  const sign = n < 0 ? '-' : ''
  return sign + String(Math.trunc(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function formatVnd(n: number): string {
  return `${formatNumber(n)}đ`
}

/** "+100" / "-500" */
export function formatSignedPoints(n: number): string {
  return `${n > 0 ? '+' : ''}${formatNumber(n)}`
}

/** 0900001004 → "0900***004" */
export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 4)}***${phone.slice(-3)}`
}

/** Bỏ dấu tiếng Việt + chữ thường, dùng khi so khớp tìm kiếm. */
export function foldVietnamese(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

/** Lấy chữ số từ chuỗi → number; rỗng → null. */
export function parseDigits(s: string): number | null {
  const digits = s.replace(/\D/g, '')
  return digits ? Number(digits) : null
}
