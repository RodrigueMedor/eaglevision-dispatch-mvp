import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, LifeBuoy, Mail, Phone, Send } from 'lucide-react'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { createThread } from '@/services/commands'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { FaqAccordion } from '@/features/public/sections'

export function PortalSupport() {
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const toast = useToast()
  const navigate = useNavigate()
  const [topic, setTopic] = useState('Load issue')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!subject.trim() || !body.trim()) return setError('Please add a subject and description')
    const res = createThread(state, actor.carrier.id, `Support · ${topic}: ${subject.trim()}`, body.trim(), actor.name, actor.role, 'in-app', 'carrier')
    update((s) => ({ ...s, threads: [res.state.threads[0]!, ...s.threads] }))
    toast({ title: 'Support request created', description: 'Our team typically responds within 1 business hour.' })
    navigate('/portal/messages')
  }

  return (
    <>
      <PageHeader title="Support" description="We’re here to help — on the road or in the office." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Phone, t: 'Call dispatch', v: state.settings.supportPhone, s: '24/7 for active loads' },
          { icon: Mail, t: 'Email support', v: state.settings.supportEmail, s: 'Replies within 1 business hour' },
          { icon: Clock, t: 'Office hours', v: 'Mon–Sat · 6 AM – 10 PM ET', s: 'After-hours line for emergencies' },
        ].map(({ icon: Icon, t, v, s }) => (
          <Card key={t}>
            <Icon className="size-6 text-amber-600" />
            <p className="mt-3 text-sm font-semibold text-navy-900">{t}</p>
            <p className="text-sm text-navy-800">{v}</p>
            <p className="text-xs text-road-500">{s}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Open a support request" icon={<LifeBuoy className="size-4" />} />
          <div className="space-y-4">
            <Select label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} options={['Load issue', 'Payment / invoice', 'Documents', 'Portal access', 'Other'].map((v) => ({ value: v, label: v }))} />
            <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea label="Describe the issue" value={body} onChange={(e) => setBody(e.target.value)} error={error} rows={5} />
            <Button variant="accent" icon={<Send className="size-4" />} onClick={submit}>
              Submit request
            </Button>
          </div>
        </Card>
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <BookOpen className="size-5 text-amber-600" /> Help articles
          </h2>
          <FaqAccordion limit={6} />
        </div>
      </div>
    </>
  )
}
