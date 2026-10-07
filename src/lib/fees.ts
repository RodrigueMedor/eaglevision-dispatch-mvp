/**
 * Dispatch fee math. Percentages are SAMPLE values configured in Settings —
 * they do not represent actual customer pricing.
 */
export interface FeeBreakdown {
  gross: number
  feePct: number
  fee: number
  net: number
}

export function feeBreakdown(gross: number, feePct: number): FeeBreakdown {
  const fee = Math.round(gross * feePct) / 100
  return { gross, feePct, fee, net: Math.round((gross - fee) * 100) / 100 }
}
