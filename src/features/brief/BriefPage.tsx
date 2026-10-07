import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building,
  CircleCheck,
  ClipboardList,
  Database,
  Globe,
  LayoutDashboard,
  Palette,
  Server,
  Smartphone,
  SquareKanban,
  Truck,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { Badge, SampleTag, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useDemo } from '@/store/DemoStore'
import { EQUIPMENT } from '@/lib/equipment'
import { ROLE_DESCRIPTION, ROLE_LABEL } from '@/lib/permissions'
import { WORKFLOW } from '@/features/public/content'

const AREAS = [
  { to: '/', icon: Globe, title: 'Public Dispatch Website', body: 'Marketing site with services per equipment type, pricing, FAQ, contact and the carrier application.', links: [{ to: '/', label: 'Home' }, { to: '/services/box-truck', label: 'Box Truck page' }, { to: '/get-started', label: 'Carrier registration' }] },
  { to: '/portal', icon: Smartphone, title: 'Carrier Portal', body: 'Owner-operators and drivers manage loads, trucks, drivers, documents, invoices and messages — mobile first.', links: [{ to: '/portal', label: 'Dashboard' }, { to: '/portal/loads/EVD-24101', label: 'Load detail' }, { to: '/portal/documents', label: 'Document center' }] },
  { to: '/admin', icon: LayoutDashboard, title: 'Dispatcher / Admin Portal', body: 'Back office for applications, carriers, loads, dispatch board, accounting, reports, users and integrations.', links: [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/dispatch', label: 'Dispatch board' }, { to: '/admin/load-board', label: 'Load board (demo)' }] },
  { to: '/design-system', icon: Palette, title: 'Design System', body: 'Brand identity, tokens and the reusable component library used across every screen.', links: [{ to: '/design-system', label: 'Components & tokens' }] },
]

const WALKTHROUGH = [
  { title: 'Explore the public website', body: 'Review the homepage, the Box Truck service page and pricing.', to: '/' },
  { title: 'Register as a carrier', body: 'Complete the 6-step application — use “Fill with sample data” to go fast. It ends in “Under Review”.', to: '/get-started' },
  { title: 'Approve the application', body: 'As a dispatcher, open the new application, review documents and approve it.', to: '/admin/applications' },
  { title: 'Find & assign a load', body: 'On the demo Load Board, negotiate a rate and assign a box-truck load to Eagle Transport LLC.', to: '/admin/load-board' },
  { title: 'Carrier accepts the load', body: 'Switch to the Carrier Portal, open the load offer and accept it.', to: '/portal/loads' },
  { title: 'Dispatch & track', body: 'Drag the load across the Dispatch Board: Assigned → Dispatched → Picked Up → In Transit.', to: '/admin/dispatch' },
  { title: 'Upload POD from the road', body: 'Use Mobile preview, switch the role to Driver and upload the POD for a delivered load.', to: '/portal/loads/EVD-24108' },
  { title: 'Invoice & get paid', body: 'As Accounting, send the invoice and mark it paid — dispatch fee and carrier net are calculated.', to: '/admin/invoices' },
  { title: 'Review the business', body: 'Explore reports, the communication center, users & roles and integrations.', to: '/admin/reports' },
]

const STACK = [
  { layer: 'Frontend (this MVP)', tech: 'React · Vite · TypeScript · Tailwind CSS · React Router', status: 'Built' },
  { layer: 'Backend', tech: 'Java 21 · Spring Boot REST APIs · Spring Security (RBAC)', status: 'Planned' },
  { layer: 'Database', tech: 'PostgreSQL (carriers, trucks, loads, documents, invoices…)', status: 'Planned' },
  { layer: 'Cache / sessions', tech: 'Redis', status: 'Planned' },
  { layer: 'Documents', tech: 'Private S3-compatible object storage, signed URLs', status: 'Planned' },
  { layer: 'Notifications', tech: 'Twilio SMS · transactional email', status: 'Mocked' },
  { layer: 'Integrations', tech: 'DAT · Truckstop · Google Maps · Stripe · QuickBooks · DocuSign', status: 'Mocked' },
  { layer: 'Delivery', tech: 'GitHub · GitHub Actions CI/CD · Docker · NGINX · HTTPS', status: 'Planned' },
]

const API = [
  ['Carrier onboarding', 'POST /api/v1/applications · POST /applications/{id}/decision'],
  ['Carriers & fleet', 'GET/POST /api/v1/carriers · /trucks · /drivers'],
  ['Loads', 'GET/POST /api/v1/loads · PATCH /loads/{id}/status · POST /loads/{id}/assign'],
  ['Documents', 'POST /api/v1/loads/{id}/documents · /carriers/{id}/documents (multipart → object storage)'],
  ['Accounting', 'GET /api/v1/invoices · POST /invoices/{id}/send · POST /invoices/{id}/payments'],
  ['Communication', 'GET/POST /api/v1/threads · /notifications · webhooks/twilio'],
  ['Reporting', 'GET /api/v1/reports/{loads|revenue|fees|carriers|lanes}'],
]

const PHASES = [
  { n: 1, title: 'Foundation & Architecture', items: 'Requirements, project setup, database model, authentication, API foundation' },
  { n: 2, title: 'Public Website & Onboarding', items: 'Marketing website, service pages, carrier registration, document intake' },
  { n: 3, title: 'Operations Platform', items: 'Carrier portal, dispatcher back office, load/document workflows, notifications, approved integrations' },
  { n: 4, title: 'Production Launch', items: 'End-to-end testing, security review, deployment, monitoring, handoff' },
]

export default function BriefPage() {
  const { state } = useDemo()
  const [diagram, setDiagram] = useState(false)

  return (
    <div className="min-h-[calc(100dvh-var(--proto-h))] bg-road-50">
      <header className="relative overflow-hidden bg-navy-950 text-white">
        <div className="grid-bg absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="flex flex-wrap items-center gap-3">
            <Logo inverse />
            <span className="rounded-full border border-amber-400/50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300">MVP Prototype · for client review</span>
          </div>
          <h1 className="mt-8 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Truck Dispatch Website &amp; Operations Platform</h1>
          <p className="mt-4 max-w-3xl text-lg text-navy-200">
            A clickable prototype of the proposed platform: the public dispatch website, carrier onboarding, the carrier portal and the dispatcher back office — built on the same React + TypeScript foundation planned for production.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Meta label="Prepared by" value="Eagle Vision Edge LLC" />
            <Meta label="Date" value="October 2026" />
            <Meta label="Equipment" value="8 types · Box truck focus" />
            <Meta label="Data" value="100% fictional sample data" />
          </div>
        </div>
        <div className="road-stripe h-1.5 animate-road" aria-hidden />
      </header>

      <div className="container-page space-y-14 py-12">
        <section>
          <SectionTitle eyebrow="Start here" title="Prototype areas" description="Use the bar at the top to switch areas, preview Desktop / Tablet / Mobile, change roles, or reset the demo at any time." />
          <div className="grid gap-4 md:grid-cols-2">
            {AREAS.map(({ to, icon: Icon, title, body, links }) => (
              <div key={title} className="flex flex-col rounded-2xl border border-road-200 bg-white p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-amber-400">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy-900">{title}</h3>
                    <p className="mt-1 text-sm text-road-600">{body}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 pl-16">
                  {links.map((l) => (
                    <Link key={l.to} to={l.to} className="inline-flex items-center gap-1 rounded-lg bg-road-100 px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-amber-100">
                      {l.label} <ArrowRight className="size-3" />
                    </Link>
                  ))}
                </div>
                <Link to={to} className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold text-amber-700 hover:underline">
                  Open {title} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="Guided demo" title="Walk a load from application to payment" description="About 10 minutes. Each step links to the right screen." />
          <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {WALKTHROUGH.map((s, i) => (
              <li key={s.title}>
                <Link to={s.to} className="group flex h-full gap-4 rounded-2xl border border-road-200 bg-white p-5 transition-shadow hover:shadow-lift">
                  <span className="font-condensed text-3xl font-bold text-amber-500">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block font-semibold text-navy-900 group-hover:text-amber-700">{s.title}</span>
                    <span className="mt-1 block text-sm text-road-600">{s.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Proposal §2" title="Business objectives" />
            <ul className="space-y-2.5">
              {[
                'Establish a professional online presence for the dispatch business',
                'Generate qualified carrier and owner-operator leads',
                'Clearly present dispatch services for different equipment types',
                'Digitize carrier registration and document collection',
                'Provide a secure portal for carriers and dispatch staff',
                'Centralize load, truck, document, fee and operational information',
                'Create a scalable foundation for integrations and automation',
              ].map((o) => (
                <li key={o} className="flex gap-3 rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-road-200">
                  <CircleCheck className="size-5 shrink-0 text-emerald-600" /> {o}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle eyebrow="Proposal §3" title="Supported equipment" />
            <div className="grid grid-cols-2 gap-3">
              {EQUIPMENT.map((e) => (
                <Link key={e.type} to={`/services/${e.slug}`} className={`rounded-xl bg-white p-3 ring-1 hover:shadow-card ${e.featured ? 'ring-2 ring-amber-500' : 'ring-road-200'}`}>
                  <EquipmentGlyph type={e.type} />
                  <p className="mt-2 text-sm font-semibold text-navy-900">
                    {e.label} {e.featured && <Badge tone="warning" size="sm">Priority</Badge>}
                  </p>
                  <p className="text-xs text-road-500">{e.short}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="Proposal §8" title="Load workflow" description="Implemented as the load status model used by the carrier portal timeline, dispatch board and accounting." />
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <ol className="flex min-w-max items-center gap-2">
              {WORKFLOW.map((w, i) => (
                <li key={w} className="flex items-center gap-2">
                  <span className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-navy-900 ring-1 ring-road-200">
                    <span className="mr-1.5 font-bold text-amber-600">{i + 1}</span>
                    {w}
                  </span>
                  {i < WORKFLOW.length - 1 && <ArrowRight className="size-4 shrink-0 text-road-300" />}
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['opportunity', 'review', 'approved', 'dispatched', 'pickup', 'in-transit', 'delivered', 'pod-received', 'invoiced', 'completed'] as const).map((s) => (
              <StatusBadge key={s} kind="load" value={s} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="Proposal §11" title="User roles" description="Switch roles from the prototype bar inside the Carrier Portal or Admin portal to see navigation and actions change." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(['super-admin', 'admin', 'dispatcher', 'accounting', 'support', 'carrier', 'driver'] as const).map((r) => (
              <div key={r} className="rounded-2xl bg-white p-4 ring-1 ring-road-200">
                <div className="flex items-center gap-2">
                  {r === 'carrier' || r === 'driver' ? <Truck className="size-4 text-amber-600" /> : <Building className="size-4 text-navy-600" />}
                  <p className="font-semibold text-navy-900">{ROLE_LABEL[r]}</p>
                </div>
                <p className="mt-1.5 text-sm text-road-600">{ROLE_DESCRIPTION[r]}</p>
                <Link to={r === 'carrier' || r === 'driver' ? '/portal' : '/admin'} className="mt-2 inline-block text-xs font-semibold text-navy-600 hover:text-amber-700">
                  {r === 'carrier' || r === 'driver' ? 'Carrier Portal →' : 'Admin portal →'}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="Architecture" title="From prototype to production" description="This MVP is the real frontend foundation. Mock services in src/services mirror the planned Spring Boot modules and REST endpoints." />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
            <button type="button" onClick={() => setDiagram(true)} className="group overflow-hidden rounded-2xl bg-white p-2 text-left ring-1 ring-road-200 hover:shadow-lift">
              <img src="/architecture.jpg" alt="Proposed truck dispatch platform system architecture diagram" className="w-full rounded-xl" loading="lazy" />
              <p className="px-2 py-2 text-xs font-semibold text-navy-600 group-hover:text-amber-700">Figure 1 · Proposed system architecture — click to enlarge</p>
            </button>
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-road-200">
              <table className="w-full text-sm">
                <thead className="bg-road-50 text-xs uppercase tracking-wide text-road-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Layer</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Technology</th>
                    <th className="px-4 py-2.5 text-right font-semibold">MVP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-road-100">
                  {STACK.map((s) => (
                    <tr key={s.layer}>
                      <td className="px-4 py-2.5 font-semibold text-navy-900">{s.layer}</td>
                      <td className="px-4 py-2.5 text-road-600">{s.tech}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge tone={s.status === 'Built' ? 'success' : s.status === 'Mocked' ? 'warning' : 'neutral'} size="sm">
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <div className="flex items-center gap-2">
                <Server className="size-5 text-amber-400" />
                <h3 className="font-display font-bold">Planned REST API surface</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {API.map(([k, v]) => (
                  <li key={k}>
                    <p className="font-semibold text-amber-300">{k}</p>
                    <p className="break-words font-mono text-xs text-navy-200">{v}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-road-200">
              <div className="flex items-center gap-2">
                <Database className="size-5 text-amber-600" />
                <h3 className="font-display font-bold text-navy-900">What is mocked in this prototype</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-road-600">
                <li>• All data is fictional and stored only in your browser (Reset demo restores it).</li>
                <li>• Logins, passwords and MFA are simulated — no real accounts.</li>
                <li>• Uploads keep only the file name; nothing leaves the browser.</li>
                <li>• SMS, email, maps, payments, accounting and e-signature are simulated.</li>
                <li>• DAT / Truckstop loads are SAMPLE data — no scraping; live access requires provider API agreements.</li>
                <li>• Dispatch fee ({state.settings.dispatchFeePct}%) and pricing are configurable samples, not customer pricing.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="Proposal §9" title="Integrations" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {state.integrations.map((i) => (
              <div key={i.id} className="rounded-xl bg-white p-3 ring-1 ring-road-200">
                <p className="text-sm font-semibold text-navy-900">{i.name}</p>
                <p className="mb-2 text-xs text-road-500">{i.category}</p>
                <StatusBadge kind="integration" value={i.status} size="sm" />
              </div>
            ))}
          </div>
          <Link to="/admin/integrations" className="mt-3 inline-block text-sm font-semibold text-navy-700 hover:text-amber-700">
            View integration details →
          </Link>
        </section>

        <section>
          <SectionTitle eyebrow="Proposal §14" title="Development phases" />
          <div className="grid gap-3 md:grid-cols-4">
            {PHASES.map((p) => (
              <div key={p.n} className="rounded-2xl bg-white p-5 ring-1 ring-road-200">
                <p className="font-condensed text-sm font-bold uppercase tracking-wider text-amber-600">Phase {p.n}</p>
                <h3 className="mt-1 font-display font-bold text-navy-900">{p.title}</h3>
                <p className="mt-2 text-sm text-road-600">{p.items}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-amber-400 bg-amber-50 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <SampleTag>Prototype notice</SampleTag>
            <p className="text-sm text-amber-900">
              Company names, people, DOT/MC numbers, VINs, rates and testimonials are fictional. Final branding, content, pricing and integrations are confirmed in the Statement of Work.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
              <Globe className="size-4" /> Start with the website
            </Link>
            <Link to="/get-started" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-amber-400">
              <ClipboardList className="size-4" /> Try carrier registration
            </Link>
            <Link to="/admin/dispatch" className="inline-flex items-center gap-1.5 rounded-lg border border-road-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-road-50">
              <SquareKanban className="size-4" /> Open dispatch board
            </Link>
          </div>
        </section>
      </div>

      <Modal open={diagram} onClose={() => setDiagram(false)} title="Proposed System Architecture" size="xl">
        <img src="/architecture.jpg" alt="Proposed truck dispatch platform system architecture diagram" className="w-full rounded-lg" />
      </Modal>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-navy-400">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-5">
      <p className="font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h2>
      {description && <p className="mt-1.5 max-w-3xl text-sm text-road-600">{description}</p>}
    </div>
  )
}
