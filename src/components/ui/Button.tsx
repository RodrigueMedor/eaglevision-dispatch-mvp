import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'inverse'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
  accent: 'bg-amber-500 text-navy-950 hover:bg-amber-400 shadow-sm',
  secondary: 'bg-navy-50 text-navy-900 hover:bg-navy-100',
  outline: 'border border-road-300 bg-white text-navy-900 hover:bg-road-50 hover:border-road-400',
  ghost: 'text-navy-700 hover:bg-navy-50 hover:text-navy-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  inverse: 'border border-white/25 text-white hover:bg-white/10',
}

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', block = false, className?: string) {
  return cn(
    'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors select-none',
    'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    block && 'w-full',
    className,
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  /** renders a router link styled as a button */
  to?: string
  loading?: boolean
  block?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, to, loading, block, className, children, type = 'button', disabled, ...rest },
  ref,
) {
  const content = (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </>
  )
  if (to && !disabled) {
    return (
      <Link to={to} className={buttonClasses(variant, size, block, className)}>
        {content}
      </Link>
    )
  }
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={buttonClasses(variant, size, block, className)} {...rest}>
      {content}
    </button>
  )
})

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('inline-flex size-9 items-center justify-center rounded-lg text-road-600 transition-colors hover:bg-navy-50 hover:text-navy-900', className)}
      {...rest}
    >
      {children}
    </button>
  )
}
