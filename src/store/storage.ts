const PREFIX = 'ckvc:'

/** Đọc JSON từ localStorage, trả về `fallback` nếu không có hoặc lỗi. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* bộ nhớ đầy hoặc bị chặn — bỏ qua */
  }
}

/** Xoá toàn bộ dữ liệu của app để quay về dữ liệu mẫu. */
export function resetAll(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* bỏ qua */
  }
}

export function sessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(PREFIX + key) === '1'
  } catch {
    return false
  }
}

export function setSessionFlag(key: string): void {
  try {
    sessionStorage.setItem(PREFIX + key, '1')
  } catch {
    /* bỏ qua */
  }
}
