import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CircleCheck, Clock, FileCheck, Mail, MapPin, Phone, Plus, Quote, Send } from 'lucide-react'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { SampleTag } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { EQUIPMENT } from '@/lib/equipment'
import { cn } from '@/lib/cn'
import { BENEFITS, CONTACT, FAQS, HOW_IT_WORKS, SERVICES, TESTIMONIALS, WHAT_WE_HANDLE, WHY_US, WORKFLOW } from './content'

export function SectionHeading({ eyebrow, title, description, center, inverse }: { eyebrow?: string; title: ReactNode; description?: ReactNode; center?: boolean; inverse?: boolean }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <p className="font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">{eyebrow}</p>}
      <h2 className={cn('mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl', inverse ? 'text-white' : 'text-navy-900')}>{title}</h2>
      {description && <p className={cn('mt-3 text-base leading-relaxed', inverse ? 'text-navy-200' : 'text-road-600')}>{description}</p>}
    </div>
  )
}

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('py-16 sm:py-20', className)}>
      <div className="container-page">{children}</div>
    </section>
  )
}

/**
 * Full-bleed banner photography, served at two widths.
 *  hero-us20: OregonDOT, "Truck on U.S. 20 east of Brothers" (CC BY 2.0; trailer ad graphic removed)
 *  highway:   Bhargav Panchal / Unsplash (Unsplash License)
 *  cascadia:  Robson Hatsukami Morgan / Unsplash (Unsplash License)
 * `focus` = width + object-position used when the photo sits on the right of an inner-page banner.
 */
const BANNERS = {
  'hero-us20': { large: 2048, credit: 'Photo: OregonDOT, CC BY 2.0 (edited)', focus: 'object-[62%_50%] lg:w-[62%] lg:object-[center_45%] lg:[mask-image:linear-gradient(90deg,transparent_0%,black_35%)]' },
  highway: { large: 2400, credit: 'Photo: Bhargav Panchal / Unsplash', focus: 'object-[42%_62%] lg:w-[62%] lg:object-[center_62%] lg:[mask-image:linear-gradient(90deg,transparent_0%,black_35%)]' },
  cascadia: { large: 2400, credit: 'Photo: Robson Hatsukami Morgan / Unsplash', focus: 'object-[34%_62%] lg:w-[50%] lg:object-[center_62%] lg:[mask-image:linear-gradient(90deg,transparent_0%,black_22%)]' },
} as const

export type BannerName = keyof typeof BANNERS

function BannerPhoto({ name, className, priority }: { name: BannerName; className?: string; priority?: boolean }) {
  const large = BANNERS[name].large
  return (
    <img
      src={`/images/${name}-${large}.jpg`}
      srcSet={`/images/${name}-1200.jpg 1200w, /images/${name}-${large}.jpg ${large}w`}
      sizes="100vw"
      alt=""
      aria-hidden
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={cn('absolute -z-10 object-cover', className)}
    />
  )
}

/** Inner-page hero used by About, Services, Pricing, etc. — truck photo on the right, copy on the left. */
export function PageHero({ eyebrow, title, description, children, photo = 'highway' }: { eyebrow: string; title: ReactNode; description: ReactNode; children?: ReactNode; photo?: BannerName }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      <BannerPhoto
        name={photo}
        className={cn(
          'inset-x-0 top-0 h-[230px] w-full sm:h-[280px] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full',
          BANNERS[photo].focus,
        )}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,16,29,0.15)_0px,rgba(6,16,29,0.4)_130px,rgba(6,16,29,1)_230px)] sm:bg-[linear-gradient(180deg,rgba(6,16,29,0.15)_0px,rgba(6,16,29,0.4)_160px,rgba(6,16,29,1)_280px)] lg:bg-[linear-gradient(90deg,rgba(6,16,29,0.9)_0%,rgba(6,16,29,0.8)_40%,rgba(6,16,29,0.25)_60%,rgba(6,16,29,0)_75%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-20 bg-gradient-to-t from-navy-950/80 to-transparent" aria-hidden />
      <div className="container-page relative pb-14 pt-[190px] sm:pb-20 sm:pt-[240px] lg:py-28">
        <p className="font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl lg:max-w-2xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-navy-100 lg:max-w-xl">{description}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
      <p className="absolute bottom-3 right-3 text-[10px] text-white/50">{BANNERS[photo].credit}</p>
      <div className="road-stripe h-1.5 animate-road opacity-90" aria-hidden />
    </section>
  )
}

/* ------------------------------------------------------------------ hero */

const HERO_STATS = [
  { value: '8', label: 'Equipment types dispatched' },
  { value: '24/7', label: 'Support for active loads' },
  { value: '48', label: 'States in our lane network' },
  { value: '100%', label: 'Loads approved by you' },
]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      <BannerPhoto name="hero-us20" priority className="inset-x-0 top-0 h-[380px] w-full object-[88%_50%] sm:h-[440px] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[80%] lg:object-[center_45%] lg:[mask-image:linear-gradient(90deg,transparent_0%,black_32%)]" />
      {/* readability: vertical scrim on phones, left-to-right scrim on desktop */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,16,29,0.1)_0px,rgba(6,16,29,0.35)_220px,rgba(6,16,29,1)_380px)] sm:bg-[linear-gradient(180deg,rgba(6,16,29,0.1)_0px,rgba(6,16,29,0.35)_260px,rgba(6,16,29,1)_440px)] lg:bg-[linear-gradient(90deg,rgba(6,16,29,0.9)_0%,rgba(6,16,29,0.75)_30%,rgba(6,16,29,0.3)_44%,rgba(6,16,29,0)_56%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-navy-950/90 to-transparent" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_20%,rgba(245,165,36,0.14),transparent_50%)]" aria-hidden />

      <div className="container-page relative flex flex-col justify-end pb-12 pt-[290px] sm:pt-[340px] lg:min-h-[700px] lg:justify-center lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-navy-950/40 px-3 py-1 text-xs font-semibold text-navy-100 backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Now onboarding box truck &amp; owner-operator carriers
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight drop-shadow-md sm:text-5xl lg:text-[64px]">
            We Keep Your Truck Moving.
            <span className="block text-amber-400">You Focus on Driving.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-100">
            Professional U.S. truck dispatch for box trucks, dry vans, reefers, flatbeds, hotshots, power only and straight trucks. We find the loads, negotiate the rates and handle the paperwork.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/get-started" variant="accent" size="lg" iconRight={<ArrowRight className="size-5" />}>
              Start Dispatching
            </Button>
            <Button to="/how-it-works" variant="inverse" size="lg" className="bg-navy-950/30 backdrop-blur">
              See How It Works
            </Button>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-navy-100 sm:flex sm:flex-wrap">
            {['Box truck specialists', 'No forced dispatch', 'Transparent % fee', 'Mobile carrier portal'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CircleCheck className="size-4 shrink-0 text-amber-400" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* live-tracking chip — hints at the platform behind the service */}
        <div className="absolute right-6 top-12 hidden w-64 rounded-2xl border border-white/15 bg-navy-950/60 p-4 shadow-2xl backdrop-blur-md lg:block xl:right-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-300">Load EVD-24101</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> In transit
            </span>
          </div>
          <p className="mt-1.5 font-display text-base font-bold">Orlando, FL → Atlanta, GA</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/10">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-amber-500 to-amber-300" />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-navy-300">
            <span>$1,250 · $2.84/mi</span>
            <span className="flex items-center gap-1">
              <FileCheck className="size-3" /> ETA 9:00 AM
            </span>
          </div>
          <p className="mt-2 text-[10px] text-navy-400">Sample data</p>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-navy-950/75 backdrop-blur">
        <dl className="container-page grid grid-cols-2 gap-y-5 py-6 md:grid-cols-4">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="border-l-2 border-amber-500/70 pl-4">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-2xl font-bold text-white sm:text-3xl">{s.value}</dd>
              <dd className="text-xs text-navy-300 sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
        <p className="absolute bottom-1 right-3 text-[10px] text-navy-500">Photo: OregonDOT, CC BY 2.0 (edited)</p>
      </div>
      <div className="road-stripe h-1.5 animate-road opacity-90" aria-hidden />
    </section>
  )
}

/* ------------------------------------------------------------------ equipment */

export function EquipmentGrid({ compact }: { compact?: boolean }) {
  const [featured, ...rest] = EQUIPMENT
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        to={`/services/${featured!.slug}`}
        className="group relative overflow-hidden rounded-2xl bg-navy-900 p-6 text-white shadow-lift ring-2 ring-amber-500 sm:col-span-2 lg:row-span-2"
      >
        <span className="inline-flex rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-navy-950">Our specialty</span>
        <h3 className="mt-4 font-display text-3xl font-bold">{featured!.label} Dispatch</h3>
        <p className="mt-2 max-w-md text-navy-200">{featured!.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {featured!.sizes.slice(0, 4).map((s) => (
            <li key={s} className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-6 transition-transform duration-500 group-hover:translate-x-3">
          <EquipmentGlyph type="box-truck" inverse className="max-w-sm" />
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-400">
          Explore box truck dispatch <ArrowRight className="size-4" />
        </span>
      </Link>
      {rest.map((e) => (
        <Link key={e.slug} to={`/services/${e.slug}`} className="group flex flex-col rounded-2xl border border-road-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-lift">
          <div className="rounded-xl bg-road-50 p-3 transition-colors group-hover:bg-navy-50">
            <EquipmentGlyph type={e.type} />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{e.label}</h3>
          {!compact && <p className="mt-1 flex-1 text-sm text-road-500">{e.short}</p>}
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:text-amber-700">
            Learn more <ArrowRight className="size-3.5" />
          </span>
        </Link>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ services & benefits */

export function ServicesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SERVICES.map(({ icon: Icon, title, body }) => (
        <div key={title} className="rounded-2xl border border-road-200 bg-white p-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-navy-900 text-amber-400">
            <Icon className="size-5" />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-navy-900">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-road-600">{body}</p>
        </div>
      ))}
    </div>
  )
}

export function WhyChooseUs() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <SectionHeading eyebrow="Why choose us" title="A dispatch partner that runs like your back office" description="We combine experienced dispatchers with a modern platform, so every load, document and payment is tracked — and you always know where you stand." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {WHY_US.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-navy-900">{title}</h3>
                <p className="mt-0.5 text-sm text-road-600">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-navy-900 p-6 text-white sm:p-8">
        <div className="flex items-center justify-between">
          <p className="font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">This week · EVT-101</p>
          <SampleTag />
        </div>
        <p className="mt-3 font-display text-4xl font-bold">$6,480</p>
        <p className="text-sm text-navy-300">gross booked · 5 loads · 2,210 loaded miles</p>
        <div className="mt-6 space-y-3">
          {[
            ['Orlando, FL → Atlanta, GA', '$1,250', 'Delivered'],
            ['Atlanta, GA → Charlotte, NC', '$850', 'Delivered'],
            ['Charlotte, NC → Jacksonville, FL', '$1,180', 'In Transit'],
            ['Jacksonville, FL → Miami, FL', '$980', 'Booked'],
          ].map(([laneLabel, rate, status]) => (
            <div key={laneLabel} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm">
              <span className="min-w-0 truncate">{laneLabel}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="font-semibold">{rate}</span>
                <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-xs sm:inline">{status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Benefits() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {BENEFITS.map(({ icon: Icon, stat, body }) => (
        <div key={stat} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <Icon className="size-7 text-amber-400" />
          <h3 className="mt-4 font-display text-xl font-bold text-white">{stat}</h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-200">{body}</p>
        </div>
      ))}
    </div>
  )
}

export function HowItWorksSteps() {
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {HOW_IT_WORKS.map((s, i) => (
        <li key={s.title} className="relative rounded-2xl border border-road-200 bg-white p-6">
          <span className="font-condensed text-5xl font-bold text-amber-500/90">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="mt-2 font-display text-lg font-bold text-navy-900">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-road-600">{s.body}</p>
          {i < HOW_IT_WORKS.length - 1 && <ArrowRight className="absolute -right-5 top-1/2 hidden size-5 -translate-y-1/2 text-road-300 lg:block" aria-hidden />}
        </li>
      ))}
    </ol>
  )
}

export function WhatWeHandle() {
  return (
    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {WHAT_WE_HANDLE.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-road-200">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <span className="text-sm font-medium text-navy-900">{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** The 12-step workflow from the proposal, shown as a road. */
export function WorkflowRoad() {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-1 rounded bg-navy-800 md:left-0 md:top-6 md:h-1 md:w-full" aria-hidden />
      <ol className="relative grid gap-4 md:grid-cols-6 md:gap-y-10">
        {WORKFLOW.map((step, i) => (
          <li key={step} className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
            <span className={cn('relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-navy-950', i === WORKFLOW.length - 1 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-navy-950')}>{i + 1}</span>
            <span className="text-sm font-medium text-navy-100">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Testimonials() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <figure key={t.name} className="flex flex-col rounded-2xl border border-road-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <Quote className="size-7 text-amber-500" />
            <SampleTag>Sample testimonial</SampleTag>
          </div>
          <blockquote className="mt-4 flex-1 text-base leading-relaxed text-navy-900">“{t.quote}”</blockquote>
          <figcaption className="mt-5 border-t border-road-100 pt-4">
            <p className="text-amber-500" aria-label={`${t.rating} stars`}>
              {'★'.repeat(t.rating)}
            </p>
            <p className="mt-1 font-semibold text-navy-900">{t.name}</p>
            <p className="text-sm text-road-500">{t.role}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-amber-500">
      <div className="container-page relative flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">Ready to keep your truck loaded?</h2>
          <p className="mt-2 max-w-xl text-navy-900/80">Apply in about 10 minutes. A dispatcher will review your application and contact you within one business day.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/get-started" size="lg" iconRight={<ArrowRight className="size-5" />}>
            Apply as a Carrier
          </Button>
          <Button to="/contact" size="lg" variant="outline" className="border-navy-950/20 bg-transparent hover:bg-white/30">
            Talk to Dispatch
          </Button>
        </div>
      </div>
      <div className="absolute -right-10 bottom-0 hidden w-80 opacity-20 lg:block" aria-hidden>
        <EquipmentGlyph type="dry-van" />
      </div>
    </section>
  )
}

export function FaqAccordion({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0)
  const items = limit ? FAQS.slice(0, limit) : FAQS
  return (
    <div className="divide-y divide-road-200 rounded-2xl border border-road-200 bg-white">
      {items.map((f, i) => (
        <div key={f.q}>
          <h3>
            <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-navy-900">
              {f.q}
              <Plus className={cn('size-5 shrink-0 text-road-400 transition-transform', open === i && 'rotate-45 text-amber-600')} />
            </button>
          </h3>
          {open === i && <p className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-road-600">{f.a}</p>}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ contact */

export function ContactInfo() {
  return (
    <ul className="space-y-4">
      {[
        { icon: Phone, label: 'Call dispatch', value: CONTACT.phone },
        { icon: Mail, label: 'Email', value: CONTACT.email },
        { icon: Clock, label: 'Hours', value: CONTACT.hours },
        { icon: MapPin, label: 'Office', value: CONTACT.address },
      ].map(({ icon: Icon, label, value }) => (
        <li key={label} className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-amber-400">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-road-500">{label}</p>
            <p className="text-sm font-medium text-navy-900">{value}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ContactForm() {
  const toast = useToast()
  const [values, setValues] = useState({ name: '', email: '', phone: '', equipment: '', trucks: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!values.name.trim()) errs.name = 'Please enter your name'
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = 'Enter a valid email address'
    if (values.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a 10-digit phone number'
    if (!values.equipment) errs.equipment = 'Select your equipment'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSent(true)
    toast({ title: 'Message sent (demo)', description: 'In production this creates a lead and emails the dispatch team.' })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CircleCheck className="size-12 text-emerald-600" />
        <h3 className="mt-3 font-display text-xl font-bold text-navy-900">Thanks, {values.name.split(' ')[0]}!</h3>
        <p className="mt-1 text-sm text-road-600">A dispatcher will reach out within one business day. Want to skip ahead?</p>
        <Button to="/get-started" variant="accent" className="mt-5">
          Start your application
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-2xl border border-road-200 bg-white p-5 shadow-card sm:grid-cols-2 sm:p-6">
      <Input label="Full name" required value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
      <Input label="Email" type="email" required value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
      <Input label="Phone" type="tel" required value={values.phone} onChange={set('phone')} error={errors.phone} placeholder="(555) 555-0123" autoComplete="tel" />
      <Select label="Equipment" required value={values.equipment} onChange={set('equipment')} error={errors.equipment} placeholder="Select equipment" options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
      <Select label="Number of trucks" value={values.trucks} onChange={set('trucks')} placeholder="Select" options={['1', '2–5', '6–10', '11+'].map((v) => ({ value: v, label: v }))} wrapperClassName="sm:col-span-2" />
      <Textarea label="How can we help?" value={values.message} onChange={set('message')} wrapperClassName="sm:col-span-2" placeholder="Tell us about your lanes, home base and goals." />
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-road-500">Prototype form — submissions are simulated and not sent anywhere.</p>
        <Button type="submit" variant="accent" icon={<Send className="size-4" />}>
          Send message
        </Button>
      </div>
    </form>
  )
}
