import { useState } from 'react'
import { ArrowLeft, ArrowRight, CircleCheck, Clock, FileCheck, Hourglass, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge, SampleTag } from '@/components/ui/Badge'
import { Stepper } from '@/components/ui/Stepper'
import { useToast } from '@/components/ui/Toast'
import { useDemo } from '@/store/DemoStore'
import { nextApplicationId, submitApplication } from '@/services/commands'
import { AccountStep, CompanyStep, DocumentsStep, EquipmentStep, PreferencesStep, ReviewStep } from './steps'
import { EMPTY_FORM, sampleForm, STEPS, toApplication, validateStep, type Errors, type OnboardingForm } from './form'

export function GetStartedPage() {
  const { state, update } = useDemo()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<OnboardingForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState<{ id: string; company: string; email: string } | null>(null)

  const patch: <K extends keyof OnboardingForm>(section: K, value: Partial<OnboardingForm[K]>) => void = (section, value) =>
    setForm((f) => ({ ...f, [section]: { ...(f[section] as object), ...(value as object) } }))

  const scrollTop = () => document.getElementById('onboarding-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const next = () => {
    const errs = validateStep(step, form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast({ title: 'Please complete the highlighted fields', tone: 'warning' })
      return
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      scrollTop()
      return
    }
    const id = nextApplicationId(state)
    update((s) => submitApplication(s, toApplication(form), id).state)
    setSubmitted({ id, company: form.company.legalName, email: form.account.email })
    window.scrollTo(0, 0)
    toast({ title: 'Application submitted', description: 'Confirmation email & SMS simulated.' })
  }

  const back = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
    scrollTop()
  }

  const fillSample = () => {
    setForm(sampleForm())
    setErrors({})
    toast({ title: 'Sample applicant loaded', description: 'All steps were pre-filled with fictional data.', tone: 'info' })
  }

  if (submitted) return <Submitted {...submitted} />

  const stepProps = { form, errors, patch }

  return (
    <div className="bg-road-50">
      <section className="bg-navy-900 text-white">
        <div className="container-page py-10 sm:py-12">
          <p className="font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">Carrier application</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Get started with Eagle Vision Dispatch</h1>
          <p className="mt-2 max-w-2xl text-navy-200">About 10 minutes. Save time by having your DOT/MC numbers, W-9 and Certificate of Insurance ready.</p>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        <div id="onboarding-card" className="scroll-mt-28 rounded-2xl border border-road-200 bg-white shadow-card">
          <div className="border-b border-road-100 p-4 sm:p-6">
            <Stepper steps={STEPS} current={step} onStepClick={(i) => setStep(i)} />
          </div>
          <div className="p-4 sm:p-6">
            {step === 0 && <AccountStep {...stepProps} />}
            {step === 1 && <CompanyStep {...stepProps} />}
            {step === 2 && <EquipmentStep {...stepProps} />}
            {step === 3 && <PreferencesStep {...stepProps} />}
            {step === 4 && <DocumentsStep {...stepProps} />}
            {step === 5 && <ReviewStep form={form} errors={errors} goTo={setStep} onAgree={(agree) => setForm((f) => ({ ...f, agree }))} />}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-road-100 bg-road-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button variant="ghost" onClick={back} disabled={step === 0} icon={<ArrowLeft className="size-4" />}>
              Back
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-center text-xs text-road-500 sm:text-right">
                Step {step + 1} of {STEPS.length}
              </span>
              <Button variant={step === STEPS.length - 1 ? 'accent' : 'primary'} onClick={next} iconRight={step === STEPS.length - 1 ? undefined : <ArrowRight className="size-4" />}>
                {step === STEPS.length - 1 ? 'Submit application' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-700" />
              <p className="text-sm font-semibold text-amber-900">Demo shortcut</p>
            </div>
            <p className="mt-1 text-xs text-amber-900/80">Pre-fill every step with a fictional applicant to walk through the flow quickly.</p>
            <Button size="sm" variant="outline" className="mt-3 border-amber-300 bg-white" block onClick={fillSample}>
              Fill with sample data
            </Button>
          </div>
          <div className="rounded-2xl border border-road-200 bg-white p-5">
            <h2 className="font-display font-bold text-navy-900">What you’ll need</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-road-600">
              {['USDOT & MC numbers', 'EIN', 'W-9', 'Certificate of Insurance', 'Truck year, make & model', 'Preferred lanes & states'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CircleCheck className="size-4 shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-road-200 bg-white p-5 text-sm text-road-600">
            <p className="flex items-center gap-2 font-semibold text-navy-900">
              <Lock className="size-4 text-navy-500" /> Your data is protected
            </p>
            <p className="mt-1.5 text-xs">Production: TLS encryption, private document storage and role-based access. Prototype: data stays in your browser only.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Submitted({ id, company, email }: { id: string; company: string; email: string }) {
  const steps = [
    { icon: FileCheck, title: 'Application received', body: 'Confirmation sent by email and SMS.', done: true },
    { icon: ShieldCheck, title: 'Authority & insurance verification', body: 'A dispatcher verifies DOT/MC, insurance and documents.', done: false },
    { icon: Mail, title: 'Dispatch agreement', body: 'You’ll receive the agreement to e-sign.', done: false },
    { icon: Clock, title: 'Portal activated', body: 'Start receiving load offers.', done: false },
  ]
  return (
    <div className="bg-road-50 py-12 sm:py-16">
      <div className="container-page max-w-3xl">
        <div className="rounded-3xl border border-road-200 bg-white p-6 text-center shadow-card sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
            <CircleCheck className="size-9" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-navy-900">Application Submitted</h1>
          <p className="mt-2 text-road-600">
            Thank you, <span className="font-semibold text-navy-900">{company}</span>. We sent a confirmation to {email}.
          </p>
          <div className="mx-auto mt-6 inline-flex flex-col items-center gap-2 rounded-2xl bg-road-50 px-6 py-4 ring-1 ring-road-200 sm:flex-row sm:gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-road-500">Application ID</p>
              <p className="font-display text-lg font-bold text-navy-900">{id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-road-500">Status</p>
              <Badge tone="violet" dot className="mt-1 uppercase tracking-wider">
                <Hourglass className="size-3" /> Under Review
              </Badge>
            </div>
          </div>
          <ol className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, body, done }) => (
              <li key={title} className="flex gap-3 rounded-xl border border-road-200 p-4">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-road-100 text-road-500'}`}>
                  <Icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{title}</p>
                  <p className="text-xs text-road-500">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to={`/admin/applications/${id}`} variant="primary">
              See it in the Admin portal
            </Button>
            <Button to="/" variant="outline">
              Back to website
            </Button>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-road-500">
            <SampleTag>Demo</SampleTag> The admin link shows how dispatch staff review this application.
          </p>
        </div>
      </div>
    </div>
  )
}
