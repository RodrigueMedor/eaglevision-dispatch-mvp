import { CtaBand, EquipmentGrid, PageHero, Section, SectionHeading, ServicesGrid, WhatWeHandle } from '../sections'

export function ServicesPage() {
  return (
    <>
      <PageHero photo="hero-us20" eyebrow="Dispatch services" title="Truck dispatch for every type of equipment" description="Box trucks, dry vans, reefers, flatbeds, step decks, hotshots, power only and straight trucks — each with lanes, brokers and requirements that fit." />
      <Section>
        <EquipmentGrid />
      </Section>
      <Section className="bg-road-50">
        <SectionHeading eyebrow="Included with every carrier" title="Full-service dispatch" center />
        <div className="mt-10">
          <ServicesGrid />
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow="What we handle" title="Paperwork and follow-up, handled" />
        <div className="mt-8">
          <WhatWeHandle />
        </div>
      </Section>
      <CtaBand />
    </>
  )
}
