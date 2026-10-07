import { useState } from 'react'
import { Calculator, CircleCheck, MessageSquareText, Percent } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Feedback'
import { Segmented } from '@/components/ui/Tabs'
import { useDemo } from '@/store/DemoStore'
import { feeBreakdown } from '@/lib/fees'
import { moneyCents } from '@/lib/format'
import { INCLUDED } from '../content'
import { CtaBand, FaqAccordion, PageHero, Section, SectionHeading } from '../sections'

/** The proposal asks for a configurable fee presentation OR a request-a-quote model — both are shown. */
export function PricingPage() {
  const { state } = useDemo()
  const feePct = state.settings.dispatchFeePct
  const [model, setModel] = useState<'percent' | 'quote'>('percent')
  const [gross, setGross] = useState('2500')
  const f = feeBreakdown(Number(gross) || 0, feePct)

  return (
    <>
      <PageHero photo="cascadia" eyebrow="Pricing" title="Simple, transparent dispatch pricing" description="One percentage of the gross load rate, shown on every invoice. No sign-up fees, no forced dispatch." />
      <Section>
        <Alert tone="demo" title="Sample pricing for prototype review">
          The fee shown is a configurable sample value ({feePct}%) set in Admin → Settings. It does not represent actual customer pricing. The client can present a percentage model or a request-a-quote model.
        </Alert>
        <div className="mt-6 flex justify-center">
          <Segmented
            value={model}
            onChange={setModel}
            options={[
              { value: 'percent', label: 'Percentage model' },
              { value: 'quote', label: 'Request-a-quote model' },
            ]}
          />
        </div>

        {model === 'percent' ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-navy-900 p-8 text-white">
              <Percent className="size-8 text-amber-400" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-navy-300">Dispatch fee</p>
              <p className="font-display text-6xl font-bold">
                {feePct}
                <span className="text-3xl">%</span>
              </p>
              <p className="text-navy-200">of the gross load rate · all equipment types</p>
              <ul className="mt-6 space-y-2.5">
                {INCLUDED.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CircleCheck className="size-4 shrink-0 text-amber-400" /> {i}
                  </li>
                ))}
              </ul>
              <Button to="/get-started" variant="accent" className="mt-8" block>
                Get started
              </Button>
            </div>
            <div className="rounded-3xl border border-road-200 p-8">
              <Calculator className="size-8 text-amber-600" />
              <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">Fee calculator</h2>
              <p className="mt-1 text-sm text-road-600">See exactly what you keep on a load.</p>
              <Input label="Gross load rate" type="number" min={0} value={gross} onChange={(e) => setGross(e.target.value)} leading="$" wrapperClassName="mt-6" />
              <dl className="mt-6 divide-y divide-road-100 rounded-2xl bg-road-50 px-5">
                {[
                  ['Gross load rate', moneyCents(f.gross)],
                  [`Dispatch fee (${feePct}%)`, `− ${moneyCents(f.fee)}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 text-sm">
                    <dt className="text-road-600">{k}</dt>
                    <dd className="font-semibold text-navy-900">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between py-4">
                  <dt className="font-semibold text-navy-900">Carrier net</dt>
                  <dd className="font-display text-2xl font-bold text-emerald-700">{moneyCents(f.net)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-road-500">Factoring fees, fuel and other carrier costs are not included in this example.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-road-200 p-8 text-center">
            <MessageSquareText className="mx-auto size-10 text-amber-600" />
            <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">Pricing tailored to your operation</h2>
            <p className="mt-2 text-road-600">Fees depend on equipment, number of trucks and services needed. Tell us about your fleet and we’ll send a custom quote within one business day.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to="/contact" variant="accent">
                Request a quote
              </Button>
              <Button to="/get-started" variant="outline">
                Apply now
              </Button>
            </div>
          </div>
        )}
      </Section>
      <Section className="bg-road-50">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="FAQ" title="Pricing questions" />
          <FaqAccordion limit={4} />
        </div>
      </Section>
      <CtaBand />
    </>
  )
}
