import { useState, type ReactNode } from 'react'
import { Bell, Building, CalendarClock, ChartColumn, CircleDollarSign, ClipboardList, Download, FileCheck, FileText, Fuel, Handshake, MapPin, MessageSquare, Navigation, Package, PackageCheck, Plug, Plus, Radio, Receipt, Route, Search, Send, Settings, ShieldCheck, Smartphone, Snowflake, SquareKanban, Timer, Truck, Upload, Users, Wallet } from 'lucide-react'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { Button, IconButton, type ButtonVariant } from '@/components/ui/Button'
import { Checkbox, ChoiceCard, Input, Select, Textarea, Toggle } from '@/components/ui/Form'
import { Badge, SampleTag, StatusBadge } from '@/components/ui/Badge'
import { Card, CardHeader, DescriptionList, StatCard } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { Alert, Avatar, EmptyState, ProgressBar, Stars } from '@/components/ui/Feedback'
import { FileDrop } from '@/components/ui/FileDrop'
import { Modal } from '@/components/ui/Modal'
import { FilterBar, FilterSelect, SearchInput } from '@/components/ui/PageHeader'
import { Stepper } from '@/components/ui/Stepper'
import { Segmented, Tabs } from '@/components/ui/Tabs'
import { Timeline } from '@/components/ui/Timeline'
import { useToast } from '@/components/ui/Toast'
import { BarChartView, ChartCard } from '@/components/charts/Charts'
import { SERIES } from '@/components/charts/palette'
import { EQUIPMENT } from '@/lib/equipment'
import { STATUS_MAPS, type StatusKind } from '@/lib/status'
import { BREAKPOINTS, COLOR_SCALES, FONTS, SIGNAL_COLORS } from '@/lib/tokens'
import { cn } from '@/lib/cn'

const SECTIONS = ['Brand', 'Colors', 'Typography', 'Spacing', 'Buttons', 'Inputs', 'Badges & Status', 'Cards', 'Tables', 'Navigation', 'Modals', 'Alerts & Toasts', 'Icons', 'Equipment', 'Data Viz', 'Responsive']
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-')

const ICONS = { Truck, Package, PackageCheck, Route, MapPin, Navigation, CalendarClock, FileText, FileCheck, Upload, Download, Receipt, Wallet, CircleDollarSign, MessageSquare, Bell, Users, Building, ClipboardList, SquareKanban, ChartColumn, ShieldCheck, Plug, Settings, Radio, Snowflake, Fuel, Timer, Handshake, Smartphone }

export default function DesignSystemPage() {
  const toast = useToast()
  const [modal, setModal] = useState(false)
  const [tab, setTab] = useState('one')
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a')
  const [check, setCheck] = useState(true)
  const [toggle, setToggle] = useState(true)
  const [choice, setChoice] = useState(true)
  const [file, setFile] = useState<string>()

  return (
    <div className="min-h-[calc(100dvh-var(--proto-h))] bg-white">
      <header className="border-b border-road-200 bg-navy-950 text-white">
        <div className="container-page py-10">
          <p className="font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">Design System · v0.1</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Eagle Vision Dispatch</h1>
          <p className="mt-2 max-w-2xl text-navy-200">An original logistics identity built on transportation, reliability, movement, trust and technology. Every screen in the prototype is composed from these tokens and components.</p>
        </div>
        <div className="road-stripe h-1.5 animate-road" aria-hidden />
      </header>

      <div className="container-page lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
        <nav aria-label="Design system sections" className="sticky top-[var(--proto-h)] z-10 -mx-4 overflow-x-auto border-b border-road-200 bg-white px-4 py-3 lg:top-[calc(var(--proto-h)+1.5rem)] lg:mx-0 lg:h-fit lg:overflow-visible lg:border-0 lg:px-0 lg:py-8">
          <ul className="flex gap-1 lg:flex-col">
            {SECTIONS.map((s) => (
              <li key={s}>
                <a href={`#${slug(s)}`} className="block whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-road-600 hover:bg-road-50 hover:text-navy-900">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="space-y-16 py-10">
          <Block title="Brand">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="flex items-center justify-center py-10"><Logo /></Card>
              <Card className="flex items-center justify-center bg-navy-950 py-10"><Logo inverse /></Card>
              <Card className="flex items-center justify-center gap-4 py-10"><LogoMark className="size-14" /><LogoMark className="size-9" /><LogoMark className="size-6" /></Card>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              {[
                ['Transportation', 'Equipment silhouettes, road stripes'],
                ['Reliability', 'Deep navy foundations'],
                ['Movement', 'Forward chevrons, animated lane markings'],
                ['Trust', 'Clear status, honest sample labels'],
                ['Technology', 'Dense, data-first dashboards'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl bg-road-50 p-4">
                  <p className="font-semibold text-navy-900">{t}</p>
                  <p className="text-xs text-road-500">{d}</p>
                </div>
              ))}
            </div>
          </Block>

          <Block title="Colors">
            <div className="space-y-6">
              {Object.entries(COLOR_SCALES).map(([name, scale]) => (
                <div key={name}>
                  <p className="mb-2 text-sm font-semibold capitalize text-navy-900">
                    {name} <span className="font-normal text-road-500">· {scale.role}</span>
                  </p>
                  <div className="grid grid-cols-6 overflow-hidden rounded-xl ring-1 ring-road-200 sm:grid-cols-11">
                    {Object.entries(scale.steps).map(([step, hex]) => (
                      <div key={step}>
                        <div className="h-14" style={{ background: hex }} />
                        <div className="p-1.5 text-[10px]">
                          <p className="font-semibold text-navy-900">{step}</p>
                          <p className="font-mono text-road-500">{hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SIGNAL_COLORS.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-road-200">
                    <span className="size-10 shrink-0 rounded-lg" style={{ background: c.hex }} />
                    <div className="text-xs">
                      <p className="font-semibold text-navy-900">{c.name}</p>
                      <p className="font-mono text-road-500">{c.hex}</p>
                      <p className="text-road-500">{c.use}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Block>

          <Block title="Typography">
            <div className="space-y-4">
              {FONTS.map((f) => (
                <div key={f.name} className="grid gap-2 rounded-xl p-4 ring-1 ring-road-200 sm:grid-cols-[180px_1fr] sm:items-center">
                  <div>
                    <p className="font-semibold text-navy-900">{f.name}</p>
                    <p className="text-xs text-road-500">{f.role}</p>
                  </div>
                  <p className={cn('text-xl text-navy-900', f.className)}>{f.sample}</p>
                </div>
              ))}
              <div className="space-y-2 rounded-xl p-4 ring-1 ring-road-200">
                <p className="font-display text-5xl font-bold text-navy-900">Display 48</p>
                <p className="font-display text-3xl font-bold text-navy-900">Heading 30</p>
                <p className="font-display text-xl font-semibold text-navy-900">Heading 20</p>
                <p className="text-base text-navy-900">Body 16 — Professional U.S. truck dispatch for owner-operators.</p>
                <p className="text-sm text-road-600">Body 14 — secondary text and table content.</p>
                <p className="text-xs text-road-500">Caption 12 — metadata, hints and timestamps.</p>
              </div>
            </div>
          </Block>

          <Block title="Spacing">
            <div className="flex flex-wrap items-end gap-4">
              {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
                <div key={n} className="text-center">
                  <div className="bg-amber-400" style={{ width: n * 4, height: n * 4 }} />
                  <p className="mt-1 text-xs text-road-500">{n * 4}px</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md bg-road-50 p-4 text-sm ring-1 ring-road-200">radius-md · 6px · inputs (inner)</div>
              <div className="rounded-lg bg-road-50 p-4 text-sm ring-1 ring-road-200">radius-lg · 8px · buttons, inputs</div>
              <div className="rounded-card bg-white p-4 text-sm shadow-lift ring-1 ring-road-200">radius-card · 14px · shadow-lift</div>
            </div>
          </Block>

          <Block title="Buttons">
            <div className="flex flex-wrap gap-3">
              {(['primary', 'accent', 'secondary', 'outline', 'ghost', 'success', 'danger'] as ButtonVariant[]).map((v) => (
                <Button key={v} variant={v}>
                  {v[0]!.toUpperCase() + v.slice(1)}
                </Button>
              ))}
              <span className="rounded-lg bg-navy-900 p-1">
                <Button variant="inverse">Inverse</Button>
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="xs">X-small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button icon={<Plus className="size-4" />} variant="accent">With icon</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
              <IconButton label="Notifications"><Bell className="size-5" /></IconButton>
            </div>
          </Block>

          <Block title="Inputs">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Text input" placeholder="Eagle Transport LLC" />
              <Input label="With error" required defaultValue="12345" error="USDOT numbers are 6–8 digits" />
              <Input label="With icon" leading={<Search className="size-4" />} placeholder="Search loads…" hint="Hint text helps users" />
              <Select label="Select" options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
              <Textarea label="Textarea" placeholder="Notes…" rows={3} />
              <div className="space-y-4">
                <Checkbox label="Checkbox" description="With supporting description" checked={check} onChange={(e) => setCheck(e.target.checked)} />
                <Toggle label="Toggle" description="SMS notifications" checked={toggle} onChange={setToggle} />
                <ChoiceCard selected={choice} onClick={() => setChoice((c) => !c)} title="Choice card" description="Used for equipment selection" icon={<span className="block w-12"><EquipmentGlyph type="box-truck" /></span>} />
              </div>
              <div className="md:col-span-2">
                <FileDrop label="File upload (mock)" value={file} onChange={setFile} sampleName="POD_sample.pdf" />
              </div>
            </div>
          </Block>

          <Block title="Badges & Status">
            <div className="mb-4 flex flex-wrap gap-2">
              {(['neutral', 'info', 'success', 'warning', 'danger', 'progress', 'brand', 'violet'] as const).map((t) => (
                <Badge key={t} tone={t} dot>{t}</Badge>
              ))}
              <SampleTag />
              <Stars value={4.7} />
            </div>
            <div className="space-y-3">
              {(Object.keys(STATUS_MAPS) as StatusKind[]).map((k) => (
                <div key={k} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-road-500">{k}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(STATUS_MAPS[k]).map((v) => (
                      <StatusBadge key={v} kind={k} value={v as never} size="sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid max-w-md gap-3">
              <ProgressBar value={72} tone="amber" label="Example" />
              <ProgressBar value={96} tone="green" label="Example" />
            </div>
          </Block>

          <Block title="Cards">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Active Loads" value={12} icon={<Package className="size-5" />} hint="+3 this week" />
              <StatCard label="Available Trucks" value="5/14" icon={<Truck className="size-5" />} tone="green" />
              <StatCard label="Pending PODs" value={2} icon={<Upload className="size-5" />} tone="amber" />
              <Card className="md:col-span-2">
                <CardHeader title="Card with header" description="Supporting description" actions={<Button size="sm" variant="outline">Action</Button>} />
                <DescriptionList items={[{ label: 'Carrier', value: 'Eagle Transport LLC' }, { label: 'MC', value: 'MC-1294830' }, { label: 'Truck', value: 'EVT-101' }, { label: 'Driver', value: 'Luis Ortega' }]} />
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <Avatar name="Maya Thompson" />
                  <div>
                    <p className="font-semibold text-navy-900">Maya Thompson</p>
                    <p className="text-sm text-road-500">Dispatcher</p>
                  </div>
                </div>
              </Card>
            </div>
          </Block>

          <Block title="Tables">
            <Card padded={false}>
              <div className="p-4">
                <FilterBar>
                  <SearchInput value="" onChange={() => undefined} placeholder="Search…" className="sm:w-60" />
                  <FilterSelect label="Status" value="" onChange={() => undefined} options={[{ value: 'a', label: 'Active' }]} />
                </FilterBar>
              </div>
              <DataTable
                rows={[
                  { id: 'EVD-24101', lane: 'Orlando, FL → Atlanta, GA', rate: 1250, status: 'in-transit' as const },
                  { id: 'EVD-24102', lane: 'Miami, FL → Jacksonville, FL', rate: 980, status: 'dispatched' as const },
                  { id: 'EVD-24103', lane: 'Atlanta, GA → Charlotte, NC', rate: 850, status: 'approved' as const },
                ]}
                rowKey={(r) => r.id}
                onRowClick={(r) => toast({ title: `Row clicked: ${r.id}`, tone: 'info' })}
                columns={[
                  { key: 'id', header: 'Load #', render: (r) => <span className="font-semibold">{r.id}</span>, sortValue: (r) => r.id },
                  { key: 'lane', header: 'Lane', render: (r) => r.lane },
                  { key: 'rate', header: 'Rate', render: (r) => `$${r.rate.toLocaleString()}`, sortValue: (r) => r.rate, align: 'right' },
                  { key: 'status', header: 'Status', render: (r) => <StatusBadge kind="load" value={r.status} size="sm" /> },
                ]}
              />
            </Card>
            <p className="mt-2 text-xs text-road-500">Sortable headers · row click · automatically becomes stacked cards below 640px.</p>
          </Block>

          <Block title="Navigation">
            <div className="space-y-6">
              <Tabs value={tab} onChange={setTab} tabs={[{ id: 'one', label: 'Active', count: 4 }, { id: 'two', label: 'Delivered', count: 12 }, { id: 'three', label: 'Completed' }]} />
              <Segmented value={seg} onChange={setSeg} options={[{ value: 'a', label: 'Table' }, { value: 'b', label: 'Cards' }, { value: 'c', label: 'Map' }]} />
              <Stepper steps={['Account', 'Company', 'Equipment', 'Preferences', 'Documents', 'Review']} current={2} />
              <Timeline steps={[{ key: '1', label: 'Assigned', state: 'done', meta: '2d ago' }, { key: '2', label: 'Dispatched', state: 'done' }, { key: '3', label: 'In Transit', state: 'current' }, { key: '4', label: 'Delivered', state: 'upcoming' }, { key: '5', label: 'POD', state: 'upcoming' }]} />
            </div>
          </Block>

          <Block title="Modals">
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <p className="mt-2 text-xs text-road-500">Centered dialog on desktop, bottom sheet on phones · Esc and overlay close · focus-safe.</p>
            <Modal open={modal} onClose={() => setModal(false)} title="Assign load EVD-24122" description="Box Truck · Dallas, TX → Houston, TX" footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button variant="accent" onClick={() => setModal(false)}>Assign</Button></>}>
              <Select label="Carrier" options={[{ value: '1', label: 'Gulf Coast Haulers LLC' }]} />
            </Modal>
          </Block>

          <Block title="Alerts & Toasts">
            <div className="space-y-3">
              <Alert tone="info" title="Info">Your dispatcher is confirming the rate confirmation.</Alert>
              <Alert tone="success" title="Success">Application approved.</Alert>
              <Alert tone="warning" title="Warning" action={<Button size="sm">Upload</Button>}>Certificate of Insurance expires in 18 days.</Alert>
              <Alert tone="danger" title="Danger">COI expired — dispatch on hold.</Alert>
              <Alert tone="demo" title="Sample data">Dashed amber marks anything that is prototype/demo content.</Alert>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" icon={<Send className="size-4" />} onClick={() => toast({ title: 'Load assigned', description: 'Carrier notified by SMS.' })}>Success toast</Button>
              <Button size="sm" variant="outline" onClick={() => toast({ title: 'Viewing as Dispatcher', tone: 'info' })}>Info toast</Button>
              <Button size="sm" variant="outline" onClick={() => toast({ title: 'Missing fields', tone: 'warning' })}>Warning toast</Button>
              <Button size="sm" variant="outline" onClick={() => toast({ title: 'Upload failed', tone: 'error' })}>Error toast</Button>
            </div>
            <Card className="mt-4">
              <EmptyState icon={<Package className="size-7" />} title="Empty state" description="Shown when a list has no records, with a clear next action." action={<Button size="sm" icon={<Download className="size-4" />}>Primary action</Button>} />
            </Card>
          </Block>

          <Block title="Icons">
            <p className="mb-3 text-sm text-road-600">Lucide icon set · 1.5–2px stroke · 16 / 20 / 24px sizes.</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-10">
              {Object.entries(ICONS).map(([name, Icon]) => {
                return (
                  <div key={name} className="flex flex-col items-center gap-1.5 rounded-lg p-3 ring-1 ring-road-200">
                    <Icon className="size-5 text-navy-800" />
                    <span className="truncate text-[10px] text-road-500">{name}</span>
                  </div>
                )
              })}
            </div>
          </Block>

          <Block title="Equipment">
            <p className="mb-3 text-sm text-road-600">Original side-view silhouettes for every supported equipment type — no stock photography.</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {EQUIPMENT.map((e) => (
                <div key={e.type} className="rounded-xl p-3 ring-1 ring-road-200">
                  <EquipmentGlyph type={e.type} />
                  <p className="mt-2 text-sm font-semibold text-navy-900">{e.label}</p>
                </div>
              ))}
              {EQUIPMENT.slice(0, 4).map((e) => (
                <div key={`inv-${e.type}`} className="rounded-xl bg-navy-900 p-3">
                  <EquipmentGlyph type={e.type} inverse />
                  <p className="mt-2 text-sm font-semibold text-white">{e.label} · inverse</p>
                </div>
              ))}
            </div>
          </Block>

          <Block title="Data Viz">
            <div className="mb-3 flex flex-wrap gap-2">
              {SERIES.map((c, i) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ring-1 ring-road-200">
                  <span className="size-3 rounded-sm" style={{ background: c }} /> Series {i + 1}
                </span>
              ))}
            </div>
            <ChartCard title="Chart card" description="Tooltip on hover · table toggle · sample tag" table={{ columns: ['Day', 'On time', 'Late'], rows: [['Mon', 18, 1], ['Tue', 22, 2], ['Wed', 20, 0]] }}>
              <BarChartView stacked data={[{ d: 'Mon', a: 18, b: 1 }, { d: 'Tue', a: 22, b: 2 }, { d: 'Wed', a: 20, b: 0 }, { d: 'Thu', a: 24, b: 1 }, { d: 'Fri', a: 19, b: 3 }]} xKey="d" series={[{ key: 'a', label: 'On time' }, { key: 'b', label: 'Late', color: '#e34948' }]} height={200} />
            </ChartCard>
          </Block>

          <Block title="Responsive">
            <div className="overflow-hidden rounded-xl ring-1 ring-road-200">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-road-100">
                  {BREAKPOINTS.map((b) => (
                    <tr key={b.name}>
                      <td className="w-40 px-4 py-3 font-semibold text-navy-900">{b.name}</td>
                      <td className="w-28 px-4 py-3 font-mono text-xs text-road-500">{b.range}</td>
                      <td className="px-4 py-3 text-road-600">{b.behavior}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-road-600">Use the Desktop / Tablet / Mobile controls in the prototype bar to see any screen at real device widths.</p>
          </Block>
        </main>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section id={slug(title)} className="scroll-mt-28">
      <h2 className="mb-5 border-b border-road-200 pb-3 font-display text-2xl font-bold text-navy-900">{title}</h2>
      {children}
    </section>
  )
}
