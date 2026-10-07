/** Helpers for building sample data relative to "now" so the demo always looks current. */
export function daysFromNow(days: number, hour = 9, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
export const nowIso = () => new Date().toISOString()
