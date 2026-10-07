import { ArrowRight, Bell, FileUp, MessageSquare, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SampleTag } from '@/components/ui/Badge'
import {
  Benefits,
  ContactForm,
  ContactInfo,
  CtaBand,
  EquipmentGrid,
  FaqAccordion,
  Hero,
  HowItWorksSteps,
  Section,
  SectionHeading,
  ServicesGrid,
  Testimonials,
  WhatWeHandle,
  WhyChooseUs,
  WorkflowRoad,
} from '../sections'

export function HomePage() {
  return (
    <>
      <Hero />

      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Supported equipment" title="Dispatch for the trucks that move America" description="From 16 ft box trucks to step decks — every equipment type gets lanes, brokers and load requirements that fit." />
          <Button to="/services" variant="outline" iconRight={<ArrowRight className="size-4" />}>
            All services
          </Button>
        </div>
        <div className="mt-10">
          <EquipmentGrid />
        </div>
      </Section>

      <Section className="bg-road-50">
        <SectionHeading eyebrow="Dispatch services" title="Everything between “load posted” and “paid”" description="Your dispatcher works as an extension of your business — sourcing, negotiating and managing every load." center />
        <div className="mt-10">
          <ServicesGrid />
        </div>
      </Section>

      <Section>
        <WhyChooseUs />
      </Section>

      <Section className="bg-road-50">
        <SectionHeading eyebrow="How dispatch works" title="On the road in four steps" center />
        <div className="mt-10">
          <HowItWorksSteps />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="What we handle" title="The calls, paperwork and follow-up — handled" description="Spend your hours driving, not chasing brokers, rate confirmations or payments." />
        <div className="mt-10">
          <WhatWeHandle />
        </div>
      </Section>

      <section className="bg-navy-950 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Carrier benefits" title="Built to grow your trucking business" inverse />
          <div className="mt-10">
            <Benefits />
          </div>
          <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Your carrier portal" title="Your loads, documents and payments — in your pocket" description="Owner-operators and drivers can see assigned loads, upload BOL/POD photos, track payments and message dispatch from any phone." inverse />
              <ul className="mt-6 space-y-3 text-navy-100">
                {[
                  { icon: Package, t: 'Assigned loads with pickup & delivery details' },
                  { icon: FileUp, t: 'Upload BOL & POD photos from the road' },
                  { icon: Bell, t: 'SMS & email alerts for new loads and reminders' },
                  { icon: MessageSquare, t: 'Message your dispatcher in one thread per load' },
                ].map(({ icon: Icon, t }) => (
                  <li key={t} className="flex items-center gap-3 text-sm">
                    <Icon className="size-5 text-amber-400" /> {t}
                  </li>
                ))}
              </ul>
              <Button to="/portal" variant="accent" className="mt-8" iconRight={<ArrowRight className="size-4" />}>
                Preview the carrier portal
              </Button>
            </div>
            <PhoneMock />
          </div>
        </div>
      </section>

      <Section>
        <div className="rounded-3xl bg-navy-900 p-6 sm:p-10">
          <SectionHeading eyebrow="Dispatch process" title="Every load follows a clear, tracked workflow" description="Each step is recorded in the platform, so carriers, dispatchers and accounting always see the same status." inverse />
          <div className="mt-10">
            <WorkflowRoad />
          </div>
        </div>
      </Section>

      <Section className="bg-road-50">
        <SectionHeading eyebrow="Carrier stories" title="What carriers say" description="Placeholder testimonials for layout review — to be replaced with approved client testimonials." center />
        <div className="mt-10">
          <Testimonials />
        </div>
      </Section>

      <CtaBand />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Questions carriers ask" />
            <Button to="/faq" variant="outline" className="mt-6" iconRight={<ArrowRight className="size-4" />}>
              All FAQs
            </Button>
          </div>
          <FaqAccordion limit={5} />
        </div>
      </Section>

      <Section className="bg-road-50" id="contact">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="Contact" title="Talk to a dispatcher" description="Tell us about your truck and lanes. We’ll explain how dispatch would work for your business." />
            <div className="mt-8">
              <ContactInfo />
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  )
}

function PhoneMock() {
  return (
    <div className="mx-auto w-[280px] rounded-[40px] bg-black p-3 shadow-2xl ring-1 ring-white/10">
      <div className="overflow-hidden rounded-[30px] bg-road-50">
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <span className="font-condensed text-sm font-bold uppercase text-navy-900">My Loads</span>
          <SampleTag />
        </div>
        <div className="space-y-2.5 p-3">
          {[
            { id: 'EVD-24101', lane: 'Orlando → Atlanta', s: 'In Transit', c: 'bg-blue-50 text-blue-800', r: '$1,250' },
            { id: 'EVD-24102', lane: 'Miami → Jacksonville', s: 'Dispatched', c: 'bg-navy-900 text-white', r: '$980' },
            { id: 'EVD-24103', lane: 'Atlanta → Charlotte', s: 'Approved', c: 'bg-sky-50 text-sky-800', r: '$850' },
          ].map((l) => (
            <div key={l.id} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-road-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-road-500">{l.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${l.c}`}>{l.s}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-navy-900">{l.lane}</p>
              <p className="text-xs text-road-500">{l.r} · 26&apos; Box Truck</p>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
            <FileUp className="size-4" /> Tap to upload POD for EVD-24108
          </div>
        </div>
      </div>
    </div>
  )
}
