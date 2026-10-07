import type { ReactNode } from 'react'
import type { EquipmentType } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * Original side-view silhouettes for each equipment type (no stock imagery).
 * All glyphs share a 120×48 viewBox and face right.
 */
export function EquipmentGlyph({ type, inverse, className }: { type: EquipmentType; inverse?: boolean; className?: string }) {
  const body = inverse ? 'rgba(255,255,255,0.14)' : '#e1e8f1'
  const line = inverse ? 'rgba(255,255,255,0.45)' : '#94a9c6'
  const cab = '#f5a524'
  const glass = inverse ? '#0b1b2e' : '#ffffff'
  const tire = inverse ? '#06101d' : '#0b1b2e'
  const hub = inverse ? '#94a9c6' : '#c3d0e1'
  const cargo = inverse ? 'rgba(255,255,255,0.55)' : '#5f7ba3'

  const wheel = (x: number) => (
    <g key={x}>
      <circle cx={x} cy={40} r={5.5} fill={tire} />
      <circle cx={x} cy={40} r={2} fill={hub} />
    </g>
  )
  const tractor = (x: number) => (
    <g>
      <path d={`M${x} 14h13l11 10v11h-24z`} fill={cab} />
      <path d={`M${x + 3} 17h9l7 7h-16z`} fill={glass} />
      <rect x={x - 6} y={33} width={8} height={3} fill={tire} />
    </g>
  )

  const glyphs: Record<EquipmentType, ReactNode> = {
    'box-truck': (
      <>
        <rect x={6} y={6} width={70} height={28} rx={2} fill={body} stroke={line} strokeWidth={1.5} />
        <line x1={18} y1={6} x2={18} y2={34} stroke={line} />
        <path d="M78 13h15l11 11v11H78z" fill={cab} />
        <path d="M81 16h10l8 8H81z" fill={glass} />
        <rect x={6} y={34} width={98} height={3} fill={tire} />
        {[22, 94].map(wheel)}
      </>
    ),
    'straight-truck': (
      <>
        <rect x={12} y={10} width={62} height={24} rx={2} fill={body} stroke={line} strokeWidth={1.5} />
        <rect x={6} y={30} width={6} height={6} fill={line} />
        <path d="M76 14h15l11 10v11H76z" fill={cab} />
        <path d="M79 17h10l7 7H79z" fill={glass} />
        <rect x={10} y={34} width={92} height={3} fill={tire} />
        {[26, 92].map(wheel)}
      </>
    ),
    'dry-van': (
      <>
        <rect x={2} y={6} width={80} height={27} rx={1.5} fill={body} stroke={line} strokeWidth={1.5} />
        {[22, 42, 62].map((x) => <line key={x} x1={x} y1={6} x2={x} y2={33} stroke={line} strokeOpacity={0.6} />)}
        {tractor(88)}
        {[12, 24, 88, 98, 112].map(wheel)}
      </>
    ),
    reefer: (
      <>
        <rect x={2} y={6} width={78} height={27} rx={1.5} fill={body} stroke={line} strokeWidth={1.5} />
        <rect x={80} y={9} width={6} height={16} rx={1} fill={line} />
        <g stroke={inverse ? '#fff' : '#2a78d6'} strokeWidth={1.6} strokeLinecap="round">
          <line x1={41} y1={12} x2={41} y2={27} />
          <line x1={34.5} y1={15.75} x2={47.5} y2={23.25} />
          <line x1={34.5} y1={23.25} x2={47.5} y2={15.75} />
        </g>
        {tractor(90)}
        {[12, 24, 90, 100, 114].map(wheel)}
      </>
    ),
    flatbed: (
      <>
        <rect x={2} y={28} width={82} height={5} fill={line} />
        <rect x={8} y={18} width={22} height={10} rx={1} fill={cargo} />
        <rect x={34} y={20} width={18} height={8} rx={1} fill={cargo} />
        <rect x={56} y={14} width={20} height={14} rx={1} fill={cargo} />
        {tractor(88)}
        {[12, 24, 88, 98, 112].map(wheel)}
      </>
    ),
    'step-deck': (
      <>
        <path d="M2 30h58v-4h26v6H2z" fill={line} />
        <rect x={8} y={12} width={30} height={18} rx={2} fill={cargo} />
        <rect x={64} y={18} width={16} height={8} rx={1} fill={cargo} />
        {tractor(90)}
        {[12, 24, 90, 100, 114].map(wheel)}
      </>
    ),
    hotshot: (
      <>
        <rect x={2} y={28} width={66} height={4} fill={line} />
        <path d="M66 28l6-10h12v4h-9l-5 6z" fill={line} />
        <rect x={10} y={20} width={20} height={8} rx={1} fill={cargo} />
        <rect x={36} y={22} width={16} height={6} rx={1} fill={cargo} />
        <path d="M80 22h12l4-8h10l8 9v12H80z" fill={cab} />
        <path d="M98 16h7l6 7H96z" fill={glass} />
        {[18, 30, 88, 108].map(wheel)}
      </>
    ),
    'power-only': (
      <>
        <rect x={2} y={6} width={80} height={27} rx={1.5} fill="none" stroke={line} strokeWidth={1.5} strokeDasharray="5 4" />
        {tractor(88)}
        {[88, 98, 112].map(wheel)}
      </>
    ),
  }

  return (
    <svg viewBox="0 0 120 48" className={cn('h-auto w-full', className)} role="img" aria-label={type.replace('-', ' ')}>
      {glyphs[type]}
    </svg>
  )
}
