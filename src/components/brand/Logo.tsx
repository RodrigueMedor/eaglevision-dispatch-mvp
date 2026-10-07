import { cn } from '@/lib/cn'

/** Brand mark: a forward "wing" chevron over a road dash — movement + vision. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9 shrink-0', className)} aria-hidden>
      <rect width="40" height="40" rx="10" fill="#0b1b2e" />
      <path d="M8 13h13l7 7-7 7H8l7-7z" fill="#f5a524" />
      <path d="M21 13h5l7 7-7 7h-5l7-7z" fill="#f5a524" opacity="0.55" />
      <rect x="8" y="31" width="6" height="2" rx="1" fill="#ffffff" opacity="0.7" />
      <rect x="17" y="31" width="6" height="2" rx="1" fill="#ffffff" opacity="0.7" />
      <rect x="26" y="31" width="6" height="2" rx="1" fill="#ffffff" opacity="0.7" />
    </svg>
  )
}

export function Logo({ inverse, className, compact }: { inverse?: boolean; className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-condensed text-[19px] font-bold uppercase tracking-wide', inverse ? 'text-white' : 'text-navy-900')}>Eagle Vision</span>
          <span className="font-condensed text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-500">Dispatch</span>
        </span>
      )}
    </span>
  )
}
