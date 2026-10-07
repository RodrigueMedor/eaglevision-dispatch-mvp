import { Link } from 'react-router-dom'
import { Bell, CalendarClock, ClipboardList, DollarSign, FileWarning, Mail, Package, Smartphone, Truck } from 'lucide-react'
import type { AppNotification, Channel, NotificationKind } from '@/data/types'
import { EmptyState } from '@/components/ui/Feedback'
import { relative } from '@/lib/format'
import { cn } from '@/lib/cn'

export const NOTIFICATION_META: Record<NotificationKind, { label: string; icon: typeof Bell; tone: string }> = {
  'load-assigned': { label: 'New Load Assigned', icon: Package, tone: 'bg-sky-50 text-sky-700' },
  'pickup-reminder': { label: 'Pickup Reminder', icon: CalendarClock, tone: 'bg-violet-50 text-violet-700' },
  'delivery-reminder': { label: 'Delivery Reminder', icon: Truck, tone: 'bg-blue-50 text-blue-700' },
  'missing-pod': { label: 'Missing POD', icon: FileWarning, tone: 'bg-amber-50 text-amber-700' },
  'document-expiring': { label: 'Document Expiring', icon: FileWarning, tone: 'bg-red-50 text-red-600' },
  'payment-received': { label: 'Payment Received', icon: DollarSign, tone: 'bg-emerald-50 text-emerald-700' },
  application: { label: 'Carrier Application', icon: ClipboardList, tone: 'bg-navy-50 text-navy-700' },
  'status-update': { label: 'Status Update', icon: Bell, tone: 'bg-road-100 text-road-700' },
}

const CHANNEL_ICON: Record<Channel, typeof Mail> = { 'in-app': Bell, email: Mail, sms: Smartphone }

export function NotificationList({ items, onOpen, compact }: { items: AppNotification[]; onOpen?: (id: string) => void; compact?: boolean }) {
  if (items.length === 0) return <EmptyState icon={<Bell className="size-7" />} title="You’re all caught up" description="New load, document and payment alerts will appear here." />
  return (
    <ul className="divide-y divide-road-100">
      {items.map((n) => {
        const meta = NOTIFICATION_META[n.kind]
        const Icon = meta.icon
        const body = (
          <div className={cn('flex gap-3 px-4 transition-colors hover:bg-road-50', compact ? 'py-2.5' : 'py-3.5', !n.read && 'bg-amber-50/40')}>
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', meta.tone)}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className={cn('text-sm', n.read ? 'font-medium text-navy-800' : 'font-bold text-navy-900')}>{n.title}</p>
                <span className="shrink-0 text-[11px] text-road-400">{relative(n.at)}</span>
              </div>
              <p className={cn('text-sm text-road-600', compact && 'line-clamp-2 text-xs')}>{n.body}</p>
              {!compact && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {n.channels.map((c) => {
                    const CI = CHANNEL_ICON[c]
                    return (
                      <span key={c} className="inline-flex items-center gap-1 rounded bg-road-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-road-600">
                        <CI className="size-3" /> {c}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-amber-500" aria-label="Unread" />}
          </div>
        )
        return (
          <li key={n.id}>
            {n.link ? (
              <Link to={n.link} onClick={() => onOpen?.(n.id)} className="block">
                {body}
              </Link>
            ) : (
              <button type="button" onClick={() => onOpen?.(n.id)} className="block w-full text-left">
                {body}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

