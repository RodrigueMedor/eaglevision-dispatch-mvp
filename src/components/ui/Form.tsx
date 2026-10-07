import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-lg border bg-white px-3 text-sm text-navy-900 placeholder:text-road-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 disabled:bg-road-100 disabled:text-road-500'

const stateCls = (invalid?: boolean) => (invalid ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : 'border-road-300')

interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
  children: (id: string) => ReactNode
}

/** Label + control + hint/error wrapper. Children receive the generated id. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-navy-800">
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}
      {children(id)}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : hint ? <p className="text-xs text-road-500">{hint}</p> : null}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  leading?: ReactNode
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, error, required, leading, className, wrapperClassName, ...rest }, ref) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {(id) => (
        <div className="relative">
          {leading && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-road-400">{leading}</span>}
          <input ref={ref} id={id} aria-invalid={!!error} required={required} className={cn(control, 'h-10', stateCls(!!error), leading && 'pl-9', className)} {...rest} />
        </div>
      )}
    </Field>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  wrapperClassName?: string
}

export function Textarea({ label, hint, error, required, className, wrapperClassName, rows = 4, ...rest }: TextareaProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {(id) => <textarea id={id} rows={rows} aria-invalid={!!error} className={cn(control, 'py-2', stateCls(!!error), className)} {...rest} />}
    </Field>
  )
}

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  options: SelectOption[]
  placeholder?: string
  wrapperClassName?: string
}

export function Select({ label, hint, error, required, options, placeholder, className, wrapperClassName, ...rest }: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {(id) => (
        <div className="relative">
          <select id={id} aria-invalid={!!error} className={cn(control, 'h-10 appearance-none pr-9', stateCls(!!error), className)} {...rest}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-road-400" aria-hidden />
        </div>
      )}
    </Field>
  )
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: ReactNode
}

export function Checkbox({ label, description, className, checked, ...rest }: CheckboxProps) {
  return (
    <label className={cn('group flex cursor-pointer items-start gap-3', rest.disabled && 'cursor-not-allowed opacity-60', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <input type="checkbox" checked={checked} className="peer size-5 appearance-none rounded-md border border-road-300 bg-white transition-colors checked:border-navy-900 checked:bg-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500" {...rest} />
        <Check className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden />
      </span>
      <span className="text-sm">
        <span className="font-medium text-navy-900">{label}</span>
        {description && <span className="block text-road-500">{description}</span>}
      </span>
    </label>
  )
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; description?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cn('flex items-center justify-between gap-4', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
      {(label || description) && (
        <span className="text-sm">
          {label && <span className="block font-medium text-navy-900">{label}</span>}
          {description && <span className="block text-road-500">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-emerald-600' : 'bg-road-300')}
      >
        <span className={cn('inline-block size-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
      </button>
    </label>
  )
}

/** Large selectable card — used for equipment type and option pickers. */
export function ChoiceCard({ selected, onClick, title, description, icon, className }: { selected: boolean; onClick: () => void; title: ReactNode; description?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
        selected ? 'border-navy-900 bg-navy-50 ring-1 ring-navy-900' : 'border-road-200 bg-white hover:border-road-400',
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-navy-900">{title}</span>
        {description && <span className="block text-xs text-road-500">{description}</span>}
      </span>
      <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border', selected ? 'border-navy-900 bg-navy-900 text-white' : 'border-road-300')}>
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  )
}
