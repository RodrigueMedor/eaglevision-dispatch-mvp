import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Wizard stepper: full labels on desktop, compact progress on mobile. */
export function Stepper({ steps, current, onStepClick }: { steps: string[]; current: number; onStepClick?: (i: number) => void }) {
  return (
    <div>
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-navy-900">{steps[current]}</span>
          <span className="text-road-500">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-road-200">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="hidden items-center sm:flex">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <button
                type="button"
                disabled={!onStepClick || i > current}
                onClick={() => onStepClick?.(i)}
                className="group flex items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    done && 'bg-navy-900 text-white group-hover:bg-navy-700',
                    active && 'bg-amber-500 text-navy-950 ring-4 ring-amber-500/20',
                    !done && !active && 'bg-road-200 text-road-500',
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn('hidden text-sm font-medium lg:inline', active ? 'text-navy-900' : 'text-road-500')}>{label}</span>
              </button>
              {i < steps.length - 1 && <span className={cn('mx-3 h-0.5 flex-1 rounded', done ? 'bg-navy-900' : 'bg-road-200')} />}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
