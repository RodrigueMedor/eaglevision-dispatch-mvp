import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Mail, MessageSquare, MessageSquarePlus, Send, Smartphone } from 'lucide-react'
import type { Carrier, Channel, MessageThread } from '@/data/types'
import { Avatar, EmptyState } from '@/components/ui/Feedback'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { SearchInput } from '@/components/ui/PageHeader'
import { Segmented } from '@/components/ui/Tabs'
import { dateTime, relative } from '@/lib/format'
import { cn } from '@/lib/cn'

const CHANNEL_ICON: Record<Channel, typeof Mail> = { 'in-app': MessageSquare, email: Mail, sms: Smartphone }
const CHANNEL_LABEL: Record<Channel, string> = { 'in-app': 'In-app', email: 'Email', sms: 'SMS' }

interface MessageCenterProps {
  threads: MessageThread[]
  side: 'carrier' | 'staff'
  actorName: string
  carriers: Carrier[]
  /** channels the actor may send on (staff: in-app/SMS/email via Twilio & email provider) */
  channels: Channel[]
  canSend: boolean
  onSend: (threadId: string, text: string, channel: Channel) => void
  onCreate: (carrierId: string, subject: string, text: string, channel: Channel) => string
  onRead: (threadId: string) => void
  /** default carrier for new threads (portal) */
  carrierId?: string
}

export function MessageCenter({ threads, side, actorName, carriers, channels, canSend, onSend, onCreate, onRead, carrierId }: MessageCenterProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mobileShowThread, setMobileShowThread] = useState(false)
  const [q, setQ] = useState('')
  const [text, setText] = useState('')
  const [channel, setChannel] = useState<Channel>(channels[0] ?? 'in-app')
  const [composeOpen, setComposeOpen] = useState(false)

  const sorted = useMemo(
    () =>
      [...threads]
        .sort((a, b) => (b.messages.at(-1)?.at ?? '').localeCompare(a.messages.at(-1)?.at ?? ''))
        .filter((t) => !q || `${t.subject} ${carriers.find((c) => c.id === t.carrierId)?.legalName}`.toLowerCase().includes(q.toLowerCase())),
    [threads, q, carriers],
  )
  const active = sorted.find((t) => t.id === activeId) ?? sorted[0]
  const unread = (t: MessageThread) => (side === 'carrier' ? t.unreadForCarrier : t.unreadForStaff)

  useEffect(() => {
    if (active && unread(active)) onRead(active.id)
  }, [active?.id])

  const open = (id: string) => {
    setActiveId(id)
    setMobileShowThread(true)
  }

  const send = () => {
    if (!active || !text.trim()) return
    onSend(active.id, text.trim(), channel)
    setText('')
  }

  return (
    <div className="flex h-[calc(100dvh-var(--proto-h)-11rem)] min-h-[520px] overflow-hidden rounded-card border border-road-200 bg-white shadow-card">
      {/* thread list */}
      <aside className={cn('flex w-full flex-col border-r border-road-200 md:w-80 md:shrink-0', mobileShowThread && 'hidden md:flex')}>
        <div className="space-y-2 border-b border-road-100 p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search conversations…" />
          {canSend && (
            <Button size="sm" variant="secondary" block icon={<MessageSquarePlus className="size-4" />} onClick={() => setComposeOpen(true)}>
              New message
            </Button>
          )}
        </div>
        <ul className="flex-1 overflow-y-auto">
          {sorted.length === 0 && <EmptyState icon={<MessageSquare className="size-6" />} title="No conversations" />}
          {sorted.map((t) => {
            const last = t.messages.at(-1)
            const carrier = carriers.find((c) => c.id === t.carrierId)
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => open(t.id)}
                  className={cn('flex w-full gap-3 border-b border-road-100 px-3 py-3 text-left transition-colors', active?.id === t.id ? 'bg-amber-50/60' : 'hover:bg-road-50')}
                >
                  <Avatar name={side === 'staff' ? (carrier?.legalName ?? '?') : 'Eagle Vision'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate text-sm', unread(t) ? 'font-bold text-navy-900' : 'font-medium text-navy-800')}>{side === 'staff' ? carrier?.legalName : t.subject}</p>
                      <span className="shrink-0 text-[11px] text-road-400">{last && relative(last.at)}</span>
                    </div>
                    {side === 'staff' && <p className="truncate text-xs font-medium text-road-600">{t.subject}</p>}
                    <p className="truncate text-xs text-road-500">{last?.text}</p>
                  </div>
                  {unread(t) && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500" aria-label="Unread" />}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* conversation */}
      <section className={cn('flex min-w-0 flex-1 flex-col', !mobileShowThread && 'hidden md:flex')}>
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b border-road-100 px-4 py-3">
              <button type="button" onClick={() => setMobileShowThread(false)} className="rounded-lg p-1 text-road-500 md:hidden" aria-label="Back to conversations">
                <ArrowLeft className="size-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy-900">{active.subject}</p>
                <p className="truncate text-xs text-road-500">{carriers.find((c) => c.id === active.carrierId)?.legalName} · Eagle Vision Dispatch</p>
              </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto bg-road-50/60 p-4">
              {active.messages.map((m) => {
                const mine = m.from === actorName
                const Icon = CHANNEL_ICON[m.channel]
                if (m.fromRole === 'system')
                  return (
                    <p key={m.id} className="mx-auto max-w-md rounded-full bg-road-100 px-3 py-1 text-center text-xs text-road-600">
                      {m.text} · {relative(m.at)}
                    </p>
                  )
                return (
                  <div key={m.id} className={cn('flex gap-2', mine && 'flex-row-reverse')}>
                    <Avatar name={m.from} size="sm" />
                    <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm', mine ? 'rounded-tr-sm bg-navy-900 text-white' : 'rounded-tl-sm bg-white text-navy-900 ring-1 ring-road-200')}>
                      <p className={cn('mb-0.5 text-[11px] font-semibold', mine ? 'text-navy-200' : 'text-road-500')}>{m.from}</p>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className={cn('mt-1 flex items-center gap-1 text-[10px]', mine ? 'text-navy-300' : 'text-road-400')}>
                        <Icon className="size-3" /> {CHANNEL_LABEL[m.channel]} · {dateTime(m.at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            {canSend ? (
              <form
                className="border-t border-road-100 p-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
              >
                {channels.length > 1 && (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-road-500">Send via</span>
                    <Segmented value={channel} onChange={setChannel} options={channels.map((c) => ({ value: c, label: CHANNEL_LABEL[c] }))} />
                    {channel !== 'in-app' && <Badge tone="warning" size="sm">{channel === 'sms' ? 'Twilio' : 'Email provider'} · simulated</Badge>}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                    rows={1}
                    placeholder="Write a message…"
                    aria-label="Message"
                    className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-road-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <Button type="submit" variant="accent" icon={<Send className="size-4" />} disabled={!text.trim()} aria-label="Send">
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </form>
            ) : (
              <p className="border-t border-road-100 p-3 text-center text-xs text-road-500">Your role has read-only access to messages.</p>
            )}
          </>
        ) : (
          <EmptyState icon={<MessageSquare className="size-7" />} title="Select a conversation" className="m-auto" />
        )}
      </section>

      {composeOpen && (
        <ComposeModal
          side={side}
          carriers={carriers}
          carrierId={carrierId}
          channels={channels}
          onClose={() => setComposeOpen(false)}
          onSubmit={(cid, subject, body, ch) => {
            const id = onCreate(cid, subject, body, ch)
            setComposeOpen(false)
            open(id)
          }}
        />
      )}
    </div>
  )
}

function ComposeModal({ side, carriers, carrierId, channels, onClose, onSubmit }: { side: 'carrier' | 'staff'; carriers: Carrier[]; carrierId?: string; channels: Channel[]; onClose: () => void; onSubmit: (carrierId: string, subject: string, text: string, channel: Channel) => void }) {
  const [cid, setCid] = useState(carrierId ?? carriers[0]?.id ?? '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState<Channel>(channels[0] ?? 'in-app')
  const [error, setError] = useState('')
  return (
    <Modal
      open
      onClose={onClose}
      title="New message"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            icon={<Send className="size-4" />}
            onClick={() => {
              if (!subject.trim() || !body.trim()) return setError('Subject and message are required')
              onSubmit(cid, subject.trim(), body.trim(), channel)
            }}
          >
            Send
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {side === 'staff' && <Select label="To carrier" value={cid} onChange={(e) => setCid(e.target.value)} options={carriers.map((c) => ({ value: c.id, label: c.legalName }))} />}
        {channels.length > 1 && <Select label="Channel" value={channel} onChange={(e) => setChannel(e.target.value as Channel)} options={channels.map((c) => ({ value: c, label: CHANNEL_LABEL[c] }))} />}
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={side === 'staff' ? 'e.g. EVD-24101 pickup update' : 'e.g. Question about my invoice'} />
        <Textarea label="Message" value={body} onChange={(e) => setBody(e.target.value)} error={error} />
      </div>
    </Modal>
  )
}
