/** Phản hồi ngoại vi: tiếng bíp Web Audio (~880Hz, 120ms) + rung 80ms. Có công tắc âm thanh. */

const SOUND_KEY = 'tem:sound'
let ctx: AudioContext | null = null

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    /* bỏ qua */
  }
}

function beep(freq = 880, ms = 120): void {
  if (!isSoundOn()) return
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t = ctx.currentTime
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + ms / 1000 + 0.02)
  } catch {
    /* thiết bị không hỗ trợ — bỏ qua êm */
  }
}

function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* iOS không hỗ trợ — bỏ qua */
  }
}

/** Quét thành công / cộng điểm thành công. */
export function feedbackSuccess(): void {
  beep(880, 120)
  vibrate(80)
}

/** Thao tác bị từ chối (trùng mã, thiếu điểm...). */
export function feedbackError(): void {
  beep(220, 160)
  vibrate([60, 40, 60])
}
