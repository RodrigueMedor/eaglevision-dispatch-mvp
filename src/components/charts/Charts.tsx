import { useState, type ReactNode } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Table2, ChartColumn } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { SampleTag } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { CHART_INK, SERIES } from './palette'

export interface Series {
  key: string
  label: string
  color?: string
}

type Fmt = (v: number) => string
const defaultFmt: Fmt = (v) => v.toLocaleString('en-US')

/* ---------------------------------------------------------------- tooltip */

interface TooltipPayload {
  name?: string
  value?: number
  color?: string
  dataKey?: string | number
  payload?: { fill?: string }
}

function ChartTooltip({ active, payload, label, fmt }: { active?: boolean; payload?: TooltipPayload[]; label?: string | number; fmt: Fmt }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-road-200 bg-white px-3 py-2 text-xs shadow-lift">
      {label !== undefined && <p className="mb-1 font-semibold text-navy-900">{label}</p>}
      <ul className="space-y-0.5">
        {payload.map((p) => (
          <li key={String(p.dataKey ?? p.name)} className="flex items-center gap-2 text-road-600">
            <span className="size-2 rounded-full" style={{ background: p.color ?? p.payload?.fill }} aria-hidden />
            <span>{p.name}</span>
            <span className="ml-auto pl-3 font-semibold text-navy-900">{fmt(Number(p.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null
  return (
    <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-road-600">
      {series.map((s, i) => (
        <li key={s.key} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: s.color ?? SERIES[i] }} aria-hidden />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

const axisProps = { stroke: CHART_INK.axis, fontSize: 11, tickLine: false, axisLine: false } as const

/* ---------------------------------------------------------------- card wrapper */

export interface ChartTable {
  columns: string[]
  rows: (string | number)[][]
}

/** Card with title, sample-data tag and a chart/table toggle (accessible data view). */
export function ChartCard({ title, description, table, children, className, actions }: { title: string; description?: ReactNode; table?: ChartTable; children: ReactNode; className?: string; actions?: ReactNode }) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title={title}
        description={description}
        className="mb-3"
        actions={
          <>
            {actions}
            <SampleTag />
            {table && (
              <button
                type="button"
                onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))}
                className="rounded-md p-1.5 text-road-500 hover:bg-road-100 hover:text-navy-900"
                aria-label={view === 'chart' ? 'Show data table' : 'Show chart'}
                title={view === 'chart' ? 'Show data table' : 'Show chart'}
              >
                {view === 'chart' ? <Table2 className="size-4" /> : <ChartColumn className="size-4" />}
              </button>
            )}
          </>
        }
      />
      {view === 'chart' || !table ? (
        <div className="min-h-0 flex-1">{children}</div>
      ) : (
        <div className="max-h-72 overflow-auto rounded-lg border border-road-100 scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-road-50">
              <tr>
                {table.columns.map((c) => (
                  <th key={c} className="px-3 py-2 font-semibold text-road-600">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-road-100">
              {table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td key={j} className="px-3 py-1.5 text-navy-900">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

/* ---------------------------------------------------------------- charts */

export function BarChartView({ data, xKey, series, height = 240, stacked, fmt = defaultFmt, horizontal }: { data: object[]; xKey: string; series: Series[]; height?: number; stacked?: boolean; fmt?: Fmt; horizontal?: boolean }) {
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 4, right: 8, left: horizontal ? 8 : -12, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid stroke={CHART_INK.grid} vertical={!!horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" {...axisProps} tickFormatter={(v: number) => fmt(v)} />
              <YAxis type="category" dataKey={xKey} {...axisProps} width={96} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" />
              <YAxis {...axisProps} tickFormatter={(v: number) => fmt(v)} width={56} />
            </>
          )}
          <Tooltip cursor={{ fill: 'rgba(11,27,46,0.04)' }} content={<ChartTooltip fmt={fmt} />} />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color ?? SERIES[i]}
              stackId={stacked ? 'stack' : undefined}
              radius={stacked && i < series.length - 1 ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              stroke="#fff"
              strokeWidth={stacked ? 1 : 0}
              maxBarSize={36}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LineChartView({ data, xKey, series, height = 240, fmt = defaultFmt, area }: { data: object[]; xKey: string; series: Series[]; height?: number; fmt?: Fmt; area?: boolean }) {
  const Chart = area ? AreaChart : LineChart
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} margin={{ top: 6, right: 10, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" />
          <YAxis {...axisProps} tickFormatter={(v: number) => fmt(v)} width={60} />
          <Tooltip cursor={{ stroke: CHART_INK.axis, strokeDasharray: '3 3' }} content={<ChartTooltip fmt={fmt} />} />
          {series.map((s, i) => {
            const color = s.color ?? SERIES[i]
            return area ? (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.12} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
            ) : (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
            )
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}

export function DonutChartView({ data, height = 220, fmt = defaultFmt, centerLabel }: { data: { name: string; value: number; color?: string }[]; height?: number; fmt?: Fmt; centerLabel?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const colored = data.map((d, i) => ({ ...d, color: d.color ?? SERIES[i % SERIES.length]! }))
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative w-full max-w-[220px] shrink-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Pie data={colored} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={1.5} stroke="#fff" strokeWidth={2}>
              {colored.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-navy-900">{fmt(total)}</span>
          {centerLabel && <span className="text-xs text-road-500">{centerLabel}</span>}
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
        {colored.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} aria-hidden />
            <span className="truncate text-road-600">{d.name}</span>
            <span className="ml-auto font-semibold text-navy-900">{fmt(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
