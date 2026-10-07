import { Alert } from '@/components/ui/Feedback'
import { PageHero, Section } from '../sections'

const SECTIONS = {
  privacy: ['Information we collect', 'How we use information', 'Document storage & security', 'SMS & email communications', 'Sharing with brokers and partners', 'Data retention', 'Your choices', 'Contact us'],
  terms: ['Dispatch services', 'Carrier responsibilities', 'Load approval & no forced dispatch', 'Dispatch fees & invoicing', 'Documents & compliance', 'Limitation of liability', 'Termination', 'Governing law'],
}

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description="Page structure for client review." />
      <Section>
        <div className="mx-auto max-w-3xl">
          <Alert tone="demo" title="Placeholder legal content">
            Final {title.toLowerCase()} must be written and reviewed by the client’s qualified legal/compliance professionals (proposal section 17).
          </Alert>
          <ol className="mt-8 space-y-6">
            {SECTIONS[kind].map((s, i) => (
              <li key={s}>
                <h2 className="font-display text-xl font-bold text-navy-900">
                  {i + 1}. {s}
                </h2>
                <div className="mt-2 space-y-2">
                  <div className="h-3 w-full rounded bg-road-100" />
                  <div className="h-3 w-11/12 rounded bg-road-100" />
                  <div className="h-3 w-4/5 rounded bg-road-100" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  )
}
