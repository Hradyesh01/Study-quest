export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`
  return `${pad2(m)}:${pad2(sec)}`
}

// Formats a minute count as "Xh Ym" (or just "Ym" / "Xh") instead of a
// decimal-hours figure — "1h 45m" reads far better than "1.8h".
export function minutesToHoursLabel(totalMinutes) {
  const total = Math.max(0, Math.round(totalMinutes))
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function todayISO(date = new Date()) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function daysBetweenISO(fromISO, toISO) {
  const from = new Date(`${fromISO}T00:00:00`)
  const to = new Date(`${toISO}T00:00:00`)
  return Math.round((to - from) / 86400000)
}

// ISO week id like "2026-W34", used to key the weekly boss/leaderboard reset.
export function isoWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${pad2(weekNo)}`
}

export function timeAgo(iso) {
  if (!iso) return 'never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
