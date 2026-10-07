/**
 * SAMPLE HISTORICAL ANALYTICS — synthetic trend data so dashboards and reports
 * have realistic history. Live counts (active loads, KPIs) come from the demo store.
 */
import type { EquipmentType } from '@/data/types'

/** deterministic pseudo-random so charts look the same on every load */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export interface WeeklyPoint { week: string; loads: number; onTime: number; late: number }
export interface MonthlyPoint { month: string; gross: number; fees: number; loads: number }

export function weeklyLoads(weeks = 12): WeeklyPoint[] {
  const r = rng(7)
  const out: WeeklyPoint[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    const loads = Math.round(34 + (weeks - i) * 1.6 + r() * 10)
    const late = Math.round(loads * (0.03 + r() * 0.05))
    out.push({ week: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), loads, onTime: loads - late, late })
  }
  return out
}

export function monthlyRevenue(months = 12, feePct = 3): MonthlyPoint[] {
  const r = rng(13)
  const out: MonthlyPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const loads = Math.round(120 + (months - i) * 9 + r() * 25)
    const gross = Math.round(loads * (980 + r() * 220))
    out.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), loads, gross, fees: Math.round((gross * feePct) / 100) })
  }
  return out
}

export const EQUIPMENT_MIX: { equipment: EquipmentType; loads: number }[] = [
  { equipment: 'box-truck', loads: 412 },
  { equipment: 'dry-van', loads: 286 },
  { equipment: 'reefer', loads: 174 },
  { equipment: 'flatbed', loads: 121 },
  { equipment: 'hotshot', loads: 96 },
  { equipment: 'power-only', loads: 71 },
  { equipment: 'step-deck', loads: 38 },
  { equipment: 'straight-truck', loads: 44 },
]

export const CARRIER_PERFORMANCE = [
  { carrierId: 'c1', loads: 186, revenue: 214_300, onTime: 97, avgRpm: 2.61, claims: 0 },
  { carrierId: 'c2', loads: 142, revenue: 318_900, onTime: 94, avgRpm: 3.08, claims: 1 },
  { carrierId: 'c3', loads: 171, revenue: 262_400, onTime: 95, avgRpm: 2.84, claims: 0 },
  { carrierId: 'c4', loads: 64, revenue: 98_700, onTime: 91, avgRpm: 2.47, claims: 1 },
  { carrierId: 'c5', loads: 118, revenue: 141_200, onTime: 93, avgRpm: 2.58, claims: 0 },
  { carrierId: 'c6', loads: 3, revenue: 2_150, onTime: 100, avgRpm: 2.9, claims: 0 },
]

export const LANE_PERFORMANCE = [
  { lane: 'Orlando, FL → Atlanta, GA', loads: 64, avgRate: 1215, avgRpm: 2.76, onTime: 96 },
  { lane: 'Miami, FL → Jacksonville, FL', loads: 48, avgRate: 955, avgRpm: 2.77, onTime: 95 },
  { lane: 'Atlanta, GA → Charlotte, NC', loads: 57, avgRate: 862, avgRpm: 3.52, onTime: 97 },
  { lane: 'Dallas, TX → Houston, TX', loads: 41, avgRate: 705, avgRpm: 2.94, onTime: 92 },
  { lane: 'Chicago, IL → Indianapolis, IN', loads: 38, avgRate: 630, avgRpm: 3.5, onTime: 94 },
  { lane: 'Tampa, FL → Nashville, TN', loads: 22, avgRate: 2480, avgRpm: 3.26, onTime: 93 },
]

export const TRUCK_PERFORMANCE = [
  { unit: 'EVT-101', equipment: 'box-truck' as EquipmentType, loads: 74, miles: 21_400, revenue: 61_900, utilization: 88 },
  { unit: 'EVT-102', equipment: 'box-truck' as EquipmentType, loads: 66, miles: 19_100, revenue: 54_300, utilization: 82 },
  { unit: 'SUN-21', equipment: 'reefer' as EquipmentType, loads: 58, miles: 41_700, revenue: 128_800, utilization: 91 },
  { unit: 'BLL-07', equipment: 'dry-van' as EquipmentType, loads: 71, miles: 33_600, revenue: 96_100, utilization: 86 },
  { unit: 'RST-3', equipment: 'hotshot' as EquipmentType, loads: 39, miles: 14_800, revenue: 37_200, utilization: 74 },
  { unit: 'PLC-40', equipment: 'power-only' as EquipmentType, loads: 63, miles: 15_900, revenue: 52_600, utilization: 84 },
]
