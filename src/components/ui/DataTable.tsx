import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  /** enables sorting on this column */
  sortValue?: (row: T) => string | number
  className?: string
  /** hide on narrow table layouts (still shown in mobile cards unless `mobile: false`) */
  hideBelow?: 'md' | 'lg' | 'xl'
  align?: 'left' | 'right'
  /** set false to omit from the mobile card view */
  mobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  empty?: ReactNode
  /** title + subtitle used for the stacked mobile card layout */
  mobileTitle?: (row: T) => ReactNode
  mobileAside?: (row: T) => ReactNode
  initialSort?: { key: string; dir: 'asc' | 'desc' }
  className?: string
  dense?: boolean
}

const HIDE: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
}

/**
 * Reusable sortable table. Below the `sm` breakpoint it renders a stacked card
 * list — important for owner-operators using the portal from their phone.
 */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty, mobileTitle, mobileAside, initialSort, className, dense }: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      return va < vb ? -dir : va > vb ? dir : 0
    })
  }, [rows, sort, columns])

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  if (rows.length === 0) return <div className={className}>{empty}</div>

  return (
    <div className={className}>
      {/* desktop / tablet table */}
      <div className="hidden overflow-x-auto sm:block scrollbar-thin">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-road-200 bg-road-50/70">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn('px-4 font-semibold text-xs uppercase tracking-wide text-road-500', dense ? 'py-2' : 'py-3', c.hideBelow && HIDE[c.hideBelow], c.align === 'right' && 'text-right', c.className)}
                >
                  {c.sortValue ? (
                    <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 uppercase hover:text-navy-900">
                      {c.header}
                      {sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
              {onRowClick && <th className="w-8" aria-hidden />}
            </tr>
          </thead>
          <tbody className="divide-y divide-road-100">
            {sorted.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('bg-white transition-colors', onRowClick && 'cursor-pointer hover:bg-amber-50/40')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 align-middle text-navy-900', dense ? 'py-2' : 'py-3', c.hideBelow && HIDE[c.hideBelow], c.align === 'right' && 'text-right', c.className)}>
                    {c.render(row)}
                  </td>
                ))}
                {onRowClick && (
                  <td className="pr-3 text-road-300">
                    <ChevronRight className="size-4" aria-hidden />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <ul className="divide-y divide-road-100 sm:hidden">
        {sorted.map((row) => {
          const cols = columns.filter((c) => c.mobile !== false)
          const [first, ...restCols] = cols
          return (
            <li key={rowKey(row)}>
              <div
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                className={cn('block px-4 py-3', onRowClick && 'active:bg-road-50')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 font-semibold text-navy-900">{mobileTitle ? mobileTitle(row) : first?.render(row)}</div>
                  {mobileAside?.(row)}
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {(mobileTitle ? cols : restCols).map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-road-500">{c.header}</dt>
                      <dd className="truncate font-medium text-navy-900">{c.render(row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
