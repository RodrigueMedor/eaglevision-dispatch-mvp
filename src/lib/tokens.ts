/** Design tokens mirrored from src/index.css (@theme) for documentation in the Design System page. */
export const COLOR_SCALES = {
  navy: { role: 'Primary · trust & reliability', steps: { 50: '#f2f5f9', 100: '#e1e8f1', 200: '#c3d0e1', 300: '#94a9c6', 400: '#5f7ba3', 500: '#3e5c86', 600: '#2c476d', 700: '#1f3655', 800: '#142740', 900: '#0b1b2e', 950: '#06101d' } },
  amber: { role: 'Accent · highway signage & movement', steps: { 50: '#fff8eb', 100: '#feecc7', 200: '#fdd88a', 300: '#fcc14d', 400: '#f9ae2a', 500: '#f5a524', 600: '#d9820b', 700: '#b4600d', 800: '#924a12', 900: '#783d12' } },
  road: { role: 'Neutral · asphalt greys', steps: { 50: '#f7f7f6', 100: '#ededeb', 200: '#dcdbd8', 300: '#c2c1bc', 400: '#9d9b95', 500: '#7a7872', 600: '#5f5e59', 700: '#4b4a46', 800: '#33322f', 900: '#1f1e1c' } },
} as const

export const SIGNAL_COLORS = [
  { name: 'Go / success', hex: '#0f9d58', use: 'Available, delivered, paid, valid' },
  { name: 'Caution / warning', hex: '#e8a200', use: 'Expiring, invoiced, needs attention' },
  { name: 'Stop / danger', hex: '#d93636', use: 'Expired, overdue, rejected' },
  { name: 'Info / progress', hex: '#2a78d6', use: 'In transit, submitted, informational' },
]

export const FONTS = [
  { name: 'Barlow', role: 'Display & headings', className: 'font-display', sample: 'We Keep Your Truck Moving' },
  { name: 'Barlow Condensed', role: 'Eyebrows, labels, signage', className: 'font-condensed uppercase tracking-[0.2em]', sample: 'Dispatch Operations' },
  { name: 'Inter', role: 'Body, UI and data', className: 'font-sans', sample: 'Load EVD-24101 · Orlando, FL → Atlanta, GA · $1,250' },
]

export const BREAKPOINTS = [
  { name: 'Mobile', range: '< 640px', behavior: 'Tables become stacked cards, carrier portal uses bottom tab bar, modals become bottom sheets.' },
  { name: 'sm · Large phone', range: '≥ 640px', behavior: 'Tables render as tables; two-column forms.' },
  { name: 'md · Tablet', range: '≥ 768px', behavior: 'Multi-column grids, message center shows list + thread.' },
  { name: 'lg · Laptop', range: '≥ 1024px', behavior: 'Persistent sidebars in portals, full public navigation, device preview controls.' },
  { name: 'xl · Desktop', range: '≥ 1280px', behavior: 'Dense dashboards, all table columns visible, side panels.' },
]
