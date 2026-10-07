import { ContactInfo, CtaBand, FaqAccordion, PageHero, Section } from '../sections'

export function FaqPage() {
  return (
    <>
      <PageHero photo="hero-us20" eyebrow="FAQ" title="Frequently asked questions" description="Answers about dispatch service, requirements, payments and operations." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <FaqAccordion />
          <aside className="h-fit rounded-2xl bg-road-50 p-6 ring-1 ring-road-200">
            <h2 className="font-display text-lg font-bold text-navy-900">Still have questions?</h2>
            <p className="mt-1 mb-5 text-sm text-road-600">Our dispatch team is happy to help.</p>
            <ContactInfo />
          </aside>
        </div>
      </Section>
      <CtaBand />
    </>
  )
}
