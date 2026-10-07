import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Menu, Search, X } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import { Avatar } from '@/components/ui/Feedback'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { markNotificationRead, markNotificationsRead } from '@/services/commands'
import { NotificationList } from '@/features/shared/NotificationList'
import { cn } from '@/lib/cn'
import { ADMIN_NAV } from './nav'

export function AdminLayout() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const { pathname } = useLocation()
  const [drawer, setDrawer] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  useEffect(() => {
    setDrawer(false)
    setBellOpen(false)
  }, [pathname])

  const staffNotes = state.notifications.filter((n) => n.audience === 'staff')
  const unread = staffNotes.filter((n) => !n.read).length
  const pendingApps = state.applications.filter((a) => ['submitted', 'under-review'].includes(a.status)).length
  const unreadThreads = state.threads.filter((t) => t.unreadForStaff).length
  const badges: Record<string, number> = { '/admin/applications': pendingApps, '/admin/messages': unreadThreads }

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-950 text-navy-200">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <LogoMark className="size-8" />
        <div className="leading-none">
          <p className="font-condensed text-base font-bold uppercase tracking-wide text-white">Eagle Vision</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Dispatch Ops</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin" aria-label="Admin">
        {ADMIN_NAV.map((group) => {
          const items = group.items.filter((i) => !i.permission || actor.can(i.permission))
          if (items.length === 0) return null
          return (
            <div key={group.section}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-400">{group.section}</p>
              <div className="space-y-0.5">
                {items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white')}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('size-4.5', isActive ? 'text-amber-400' : 'text-navy-400')} />
                        <span className="flex-1">{label}</span>
                        {(badges[to] ?? 0) > 0 && <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-navy-950">{badges[to]}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>
      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <Avatar name={actor.user.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{actor.user.name}</p>
          <p className="truncate text-xs text-navy-400">{actor.roleLabel}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100dvh-var(--proto-h))] bg-[#f4f5f7] lg:flex">
      <aside className="sticky top-[var(--proto-h)] hidden h-[calc(100dvh-var(--proto-h))] w-64 shrink-0 lg:block">{sidebar}</aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy-950/60" onClick={() => setDrawer(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade-in shadow-2xl">{sidebar}</div>
          <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute left-[296px] top-4 rounded-lg bg-white/10 p-2 text-white">
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-[var(--proto-h)] z-30 flex h-14 items-center gap-3 border-b border-road-200 bg-white px-4 lg:px-6">
          <button type="button" onClick={() => setDrawer(true)} className="rounded-lg p-1.5 text-navy-900 lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-md bg-navy-900 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400 sm:inline">{actor.roleLabel}</span>
            <div className="relative">
              <button type="button" onClick={() => setBellOpen((o) => !o)} className="relative rounded-lg p-2 text-road-600 hover:bg-road-100" aria-label={`Notifications (${unread} unread)`} aria-expanded={bellOpen}>
                <Bell className="size-5" />
                {unread > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-navy-950">{unread}</span>}
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-11 z-50 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-road-200 bg-white shadow-lift">
                    <div className="flex items-center justify-between border-b border-road-100 px-4 py-2.5">
                      <p className="text-sm font-semibold text-navy-900">Notifications</p>
                      <button type="button" onClick={() => update((s) => markNotificationsRead(s, 'staff'))} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-600 hover:text-navy-900">
                        <CheckCheck className="size-3.5" /> Mark all read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <NotificationList compact items={staffNotes.slice(0, 8)} onOpen={(id) => update((s) => markNotificationRead(s, id))} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <Avatar name={actor.user.name} size="sm" />
          </div>
        </header>
        <main id="app-main" className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function GlobalSearch() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    if (q.trim().length < 2) return []
    const t = q.toLowerCase()
    return [
      ...state.loads.filter((l) => `${l.id} ${l.pickup.city} ${l.delivery.city}`.toLowerCase().includes(t)).slice(0, 5).map((l) => ({ to: `/admin/loads/${l.id}`, label: l.id, sub: `${l.pickup.city}, ${l.pickup.state} → ${l.delivery.city}, ${l.delivery.state}`, kind: 'Load' })),
      ...state.carriers.filter((c) => `${c.legalName} ${c.mcNumber} ${c.dotNumber}`.toLowerCase().includes(t)).slice(0, 4).map((c) => ({ to: `/admin/carriers/${c.id}`, label: c.legalName, sub: `${c.mcNumber} · DOT ${c.dotNumber}`, kind: 'Carrier' })),
      ...state.applications.filter((a) => `${a.id} ${a.company.legalName}`.toLowerCase().includes(t)).slice(0, 3).map((a) => ({ to: `/admin/applications/${a.id}`, label: a.company.legalName, sub: a.id, kind: 'Application' })),
    ]
  }, [q, state])

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-road-400" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        placeholder="Search loads, carriers, MC #…"
        aria-label="Global search"
        className="h-9 w-full rounded-lg border border-road-200 bg-road-50 pl-9 pr-3 text-sm focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
      />
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-road-200 bg-white shadow-lift">
          {results.map((r) => (
            <button
              key={r.to}
              type="button"
              onClick={() => {
                navigate(r.to)
                setQ('')
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-road-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy-900">{r.label}</span>
                <span className="block truncate text-xs text-road-500">{r.sub}</span>
              </span>
              <span className="shrink-0 rounded bg-road-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-road-600">{r.kind}</span>
            </button>
          ))}
        </div>
      )}
      {q.trim().length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-11 z-50 rounded-xl border border-road-200 bg-white px-4 py-3 text-sm text-road-500 shadow-lift">
          No matches. <Link to="/admin/loads" className="font-semibold text-navy-700">Browse loads</Link>
        </div>
      )}
    </div>
  )
}
