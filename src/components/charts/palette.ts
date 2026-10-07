/**
 * Chart palette — the validated categorical order from the dataviz reference
 * (CVD-safe on adjacent pairs). Assign in fixed order; never cycle past 8.
 */
export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'] as const

export const CHART_INK = {
  grid: '#e8e8e5',
  axis: '#7a7872',
  text: '#0b1b2e',
  muted: '#5f5e59',
}
