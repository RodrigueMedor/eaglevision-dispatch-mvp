import { Compass, Eye, HeartHandshake, ShieldCheck } from 'lucide-react'
import { SampleTag } from '@/components/ui/Badge'
import { CtaBand, PageHero, Section, SectionHeading } from '../sections'

const VALUES = [
  { icon: ShieldCheck, title: 'Integrity', body: 'Honest rates, transparent fees and no forced dispatch. Carriers approve every load.' },
  { icon: HeartHandshake, title: 'Partnership', body: 'We succeed when your truck is loaded and you are getting paid on time.' },
  { icon: Eye, title: 'Visibility', body: 'Every load, document and payment is tracked so nothing gets lost.' },
  { icon: Compass, title: 'Focus', body: 'Built for owner-operators and small fleets — especially box trucks.' },
]

export function AboutPage() {
  return (
    <>
      <PageHero photo="cascadia" eyebrow="About us" title="Dispatch built around the owner-operator" description="Eagle Vision Dispatch helps independent carriers and small fleets run like larger operations — with experienced dispatchers and a modern platform behind them." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our story" title="Why we started" />
            <div className="mt-5 space-y-4 text-road-600">
              <p>
                Owner-operators spend hours every week searching load boards, negotiating with brokers and chasing paperwork — time that should be spent driving or at home. Box truck operators in particular are often underserved by dispatch services focused on 53 ft vans.
              </p>
              <p>
                We built Eagle Vision Dispatch to change that: a dedicated dispatch team backed by a platform that keeps carriers, dispatchers and accounting on the same page — from the first load opportunity to the final payment.
              </p>
              <p className="text-xs">
                <SampleTag>Placeholder copy</SampleTag> Final company story to be provided by the client.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['8', 'Equipment types supported'],
              ['48', 'States in our lane network'],
              ['24/7', 'Support for active loads'],
              ['1', 'Dedicated dispatcher per carrier'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-navy-900 p-6 text-white">
                <p className="font-display text-4xl font-bold text-amber-400">{v}</p>
                <p className="mt-1 text-sm text-navy-200">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section className="bg-road-50">
        <SectionHeading eyebrow="Our values" title="How we work with carriers" center />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-white p-6 ring-1 ring-road-200">
              <Icon className="size-8 text-amber-600" />
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{title}</h3>
              <p className="mt-1.5 text-sm text-road-600">{body}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Market focus" title="Who we serve" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Owner-operators', 'Single-truck carriers who want a dispatcher in their corner and their evenings back.'],
            ['Small fleets (2–20 trucks)', 'Growing fleets that need consistent freight and organized back-office support.'],
            ['New authorities', 'Carriers building broker relationships and payment history with guidance on setup and compliance.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-2xl border border-road-200 p-6">
              <h3 className="font-display text-lg font-bold text-navy-900">{t}</h3>
              <p className="mt-2 text-sm text-road-600">{b}</p>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  )
}
