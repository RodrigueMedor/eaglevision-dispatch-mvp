import { ClipboardCheck, FileSignature, Headphones, Smartphone } from 'lucide-react'
import { CtaBand, HowItWorksSteps, PageHero, Section, SectionHeading, WhatWeHandle, WorkflowRoad } from '../sections'

const ONBOARDING = [
  { icon: ClipboardCheck, title: 'Application review', body: 'We verify DOT/MC authority, insurance and documents — usually within one business day.' },
  { icon: FileSignature, title: 'Dispatch agreement', body: 'Review and e-sign the dispatch agreement and confirm your fee and preferences.' },
  { icon: Smartphone, title: 'Portal setup', body: 'Get access to your carrier portal and add trucks, drivers and documents.' },
  { icon: Headphones, title: 'Meet your dispatcher', body: 'A short call to understand your lanes, home time and rate goals.' },
]

export function HowItWorksPage() {
  return (
    <>
      <PageHero eyebrow="How it works" title="Simple onboarding. Organized dispatching. Ongoing support." description="Here is exactly what happens from the moment you apply to the moment you get paid." />
      <Section>
        <HowItWorksSteps />
      </Section>
      <Section className="bg-road-50">
        <SectionHeading eyebrow="1 · Onboarding" title="What happens after you apply" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ONBOARDING.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-white p-6 ring-1 ring-road-200">
              <Icon className="size-7 text-amber-600" />
              <h3 className="mt-3 font-semibold text-navy-900">{title}</h3>
              <p className="mt-1 text-sm text-road-600">{body}</p>
            </div>
          ))}
        </div>
      </Section>
      <section className="bg-navy-950 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="2 · Dispatching" title="The life of a load" description="Every load moves through the same tracked workflow — visible to you in the carrier portal." inverse />
          <div className="mt-10">
            <WorkflowRoad />
          </div>
        </div>
      </section>
      <Section>
        <SectionHeading eyebrow="3 · Ongoing support" title="What we handle while you drive" />
        <div className="mt-8">
          <WhatWeHandle />
        </div>
      </Section>
      <CtaBand />
    </>
  )
}
