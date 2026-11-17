import type { AppState } from '../lib/types'
import { emptyState } from '../lib/rules'

export const STATE_KEY = 'tem:v1'
const ROLE_KEY = 'tem:role'

export type Role = 'tv' | 'quay'

function isAppState(x: unknown): x is AppState {
  if (!x || typeof x !== 'object') return false
  const s = x as Record<string, unknown>
  return (
    s.version === 1 &&
    Array.isArray(s.members) &&
    Array.isArray(s.txns) &&
    Array.isArray(s.vouchers) &&
    Array.isArray(s.rewards) &&
    !!s.usedTxnCodes &&
    typeof s.usedTxnCodes === 'object'
  )
}

/** Đọc state. Chưa có → state rỗng. Hỏng → state rỗng + corrupted = true (để báo toast). */
export function loadAppState(): { state: AppState; corrupted: boolean } {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw == null) return { state: emptyState(), corrupted: false }
    const parsed: unknown = JSON.parse(raw)
    if (!isAppState(parsed)) return { state: emptyState(), corrupted: true }
    return { state: { ...parsed, rewards: parsed.rewards.length ? parsed.rewards : emptyState().rewards }, corrupted: false }
  } catch {
    return { state: emptyState(), corrupted: true }
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    /* bộ nhớ đầy hoặc bị chặn — bỏ qua */
  }
}

export function loadRole(): Role {
  try {
    return localStorage.getItem(ROLE_KEY) === 'quay' ? 'quay' : 'tv'
  } catch {
    return 'tv'
  }
}

export function saveRole(role: Role): void {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    /* bỏ qua */
  }
}

const ME_KEY = 'tem:me'

export function loadCurrentMemberId(): string | null {
  try {
    const v = localStorage.getItem(ME_KEY)
    return v && /^[A-Z0-9-]{1,20}$/.test(v) ? v : null
  } catch {
    return null
  }
}

export function saveCurrentMemberId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ME_KEY, id)
    else localStorage.removeItem(ME_KEY)
  } catch {
    /* bỏ qua */
  }
}

export function sessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(`tem:${key}`) === '1'
  } catch {
    return false
  }
}

export function setSessionFlag(key: string): void {
  try {
    sessionStorage.setItem(`tem:${key}`, '1')
  } catch {
    /* bỏ qua */
  }
}
