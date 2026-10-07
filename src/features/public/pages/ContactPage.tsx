import { ContactForm, ContactInfo, PageHero, Section } from '../sections'

export function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact us" title="Let’s talk about your truck" description="Questions about dispatch, pricing or onboarding? Send us a message and a dispatcher will get back to you." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <ContactInfo />
            <div className="mt-8 flex h-56 items-center justify-center rounded-2xl bg-[repeating-linear-gradient(45deg,#f2f5f9,#f2f5f9_12px,#e1e8f1_12px,#e1e8f1_24px)] text-sm font-medium text-navy-500 ring-1 ring-road-200">
              Map placeholder · Google Maps integration (future)
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  )
}
