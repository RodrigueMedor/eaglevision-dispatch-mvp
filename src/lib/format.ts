const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
const num = new Intl.NumberFormat('en-US')
const compactUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

export const money = (n: number) => usd.format(n)
export const moneyCents = (n: number) => usdCents.format(n)
export const moneyCompact = (n: number) => compactUsd.format(n)
export const number = (n: number) => num.format(n)
export const miles = (n: number) => `${num.format(n)} mi`
export const lbs = (n: number) => `${num.format(n)} lbs`
export const ratePerMile = (rate: number, mi: number) => (mi > 0 ? `$${(rate / mi).toFixed(2)}/mi` : '—')
export const pct = (n: number, digits = 0) => `${n.toFixed(digits)}%`

export function date(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function shortDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function dateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function time(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function relative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const abs = Math.abs(diff)
  const future = diff < 0
  const fmt = (v: number, unit: string) => (future ? `in ${v}${unit}` : `${v}${unit} ago`)
  if (abs < 60) return 'just now'
  if (abs < 3600) return fmt(Math.round(abs / 60), 'm')
  if (abs < 86400) return fmt(Math.round(abs / 3600), 'h')
  return fmt(Math.round(abs / 86400), 'd')
}

export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')

export const lane = (o: { city: string; state: string }, d: { city: string; state: string }) =>
  `${o.city}, ${o.state} → ${d.city}, ${d.state}`
