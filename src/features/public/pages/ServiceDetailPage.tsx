import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CircleCheck, Package, Ruler, ShieldCheck, Users } from 'lucide-react'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { Button } from '@/components/ui/Button'
import { EQUIPMENT, equipmentBySlug } from '@/lib/equipment'
import { CtaBand, FaqAccordion, HowItWorksSteps, Section, SectionHeading } from '../sections'
import { NotFoundPage } from './NotFoundPage'

export function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const eq = equipmentBySlug(slug)
  if (!eq) return <NotFoundPage />
  const others = EQUIPMENT.filter((e) => e.slug !== eq.slug).slice(0, 4)

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="grid-bg absolute inset-0" aria-hidden />
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <Link to="/services" className="text-sm font-semibold text-amber-400 hover:underline">
              ← All dispatch services
            </Link>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">{eq.label} Dispatch</h1>
            {eq.featured && <span className="mt-3 inline-flex rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-navy-950">Our specialty</span>}
            <p className="mt-4 text-lg text-navy-200">{eq.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/get-started" variant="accent" size="lg" iconRight={<ArrowRight className="size-5" />}>
                Apply for {eq.label} Dispatch
              </Button>
              <Button to="/contact" variant="inverse" size="lg">
                Ask a question
              </Button>
            </div>
          </div>
          <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
            <EquipmentGlyph type={eq.type} inverse />
          </div>
        </div>
        <div className="road-stripe h-1.5 animate-road" aria-hidden />
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading eyebrow="Overview" title={`How we dispatch ${eq.label.toLowerCase()}s`} />
            <p className="mt-4 text-road-600">{eq.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {eq.highlights.map((h) => (
                <div key={h.title} className="rounded-2xl border border-road-200 p-5">
                  <CircleCheck className="size-6 text-emerald-600" />
                  <h3 className="mt-3 font-semibold text-navy-900">{h.title}</h3>
                  <p className="mt-1 text-sm text-road-600">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-4">
            <InfoList icon={Ruler} title="Sizes & configurations" items={eq.sizes} />
            <InfoList icon={Package} title="Common freight" items={eq.freight} />
            <InfoList icon={Users} title="Ideal for" items={eq.idealFor} />
            <InfoList icon={ShieldCheck} title="Requirements" items={eq.requirements} />
          </aside>
        </div>
      </Section>

      <Section className="bg-road-50">
        <SectionHeading eyebrow="Getting started" title="From application to first load" center />
        <div className="mt-10">
          <HowItWorksSteps />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="FAQ" title={`${eq.label} dispatch questions`} />
          <FaqAccordion limit={4} />
        </div>
      </Section>

      <Section className="bg-road-50">
        <SectionHeading eyebrow="More equipment" title="Other dispatch services" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((e) => (
            <Link key={e.slug} to={`/services/${e.slug}`} className="group rounded-2xl bg-white p-5 ring-1 ring-road-200 hover:shadow-lift">
              <EquipmentGlyph type={e.type} />
              <p className="mt-3 font-semibold text-navy-900 group-hover:text-amber-700">{e.label} →</p>
            </Link>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  )
}

function InfoList({ icon: Icon, title, items }: { icon: typeof Ruler; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-road-200 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-road-500">
        <Icon className="size-4 text-amber-600" /> {title}
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm text-navy-900">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-navy-300" /> {i}
          </li>
        ))}
      </ul>
    </div>
  )
}
