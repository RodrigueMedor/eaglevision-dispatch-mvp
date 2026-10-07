import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, Ellipsis, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Avatar } from '@/components/ui/Feedback'
import { Badge } from '@/components/ui/Badge'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { cn } from '@/lib/cn'
import { MOBILE_TABS, PORTAL_NAV } from './nav'

export function PortalLayout() {
  const { state } = useDemo()
  const actor = usePortalActor()
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => setMoreOpen(false), [pathname])

  const nav = PORTAL_NAV.filter((n) => !n.permission || actor.can(n.permission))
  const unreadNotifications = state.notifications.filter((n) => n.audience === 'carrier' && n.carrierId === actor.carrier.id && !n.read).length
  const unreadMessages = state.threads.filter((t) => t.carrierId === actor.carrier.id && t.unreadForCarrier).length
  const badge = (to: string) => (to === '/portal/notifications' ? unreadNotifications : to === '/portal/messages' ? unreadMessages : 0)

  return (
    <div className="min-h-[calc(100dvh-var(--proto-h))] bg-road-50 lg:flex">
      {/* desktop sidebar */}
      <aside className="sticky top-[var(--proto-h)] hidden h-[calc(100dvh-var(--proto-h))] w-64 shrink-0 flex-col border-r border-road-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-road-100 px-5">
          <Link to="/portal">
            <Logo />
          </Link>
        </div>
        <div className="mx-3 mt-4 rounded-xl bg-navy-900 p-3 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Carrier account</p>
          <p className="truncate font-semibold">{actor.carrier.legalName}</p>
          <p className="text-xs text-navy-300">
            {actor.carrier.mcNumber} · DOT {actor.carrier.dotNumber}
          </p>
        </div>
        <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Carrier portal">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-amber-50 text-navy-900 ring-1 ring-amber-200' : 'text-road-600 hover:bg-road-50 hover:text-navy-900')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('size-4.5', isActive ? 'text-amber-600' : 'text-road-400')} />
                  <span className="flex-1">{label}</span>
                  {badge(to) > 0 && <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-navy-950">{badge(to)}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-road-100 p-4">
          <Avatar name={actor.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900">{actor.name}</p>
            <p className="truncate text-xs text-road-500">{actor.roleLabel}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="sticky top-[var(--proto-h)] z-30 flex h-14 items-center justify-between gap-3 border-b border-road-200 bg-white/95 px-4 backdrop-blur lg:h-16 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/portal" className="lg:hidden">
              <Logo compact />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy-900 lg:hidden">{actor.carrier.legalName}</p>
              <p className="hidden text-sm text-road-500 lg:block">
                Carrier Portal · <span className="font-medium text-navy-900">{actor.carrier.legalName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actor.role === 'driver' && <Badge tone="violet">Driver view</Badge>}
            <Link to="/portal/notifications" className="relative rounded-lg p-2 text-road-600 hover:bg-road-100" aria-label={`Notifications (${unreadNotifications} unread)`}>
              <Bell className="size-5" />
              {unreadNotifications > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-navy-950">{unreadNotifications}</span>}
            </Link>
            <Link to="/portal/profile" aria-label="Profile" className="hidden sm:block lg:hidden">
              <Avatar name={actor.name} size="sm" />
            </Link>
          </div>
        </header>

        <main id="app-main" className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* mobile bottom navigation — drivers & owner-operators on the road */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-road-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Carrier portal mobile">
        <div className="grid grid-cols-5">
          {MOBILE_TABS.map((to) => {
            const item = PORTAL_NAV.find((n) => n.to === to)!
            const Icon = item.icon
            return (
              <NavLink key={to} to={to} end={item.end} className={({ isActive }) => cn('relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold', isActive ? 'text-navy-900' : 'text-road-500')}>
                {({ isActive }) => (
                  <>
                    <span className={cn('flex h-7 w-12 items-center justify-center rounded-full transition-colors', isActive && 'bg-amber-100')}>
                      <Icon className={cn('size-5', isActive && 'text-amber-700')} />
                    </span>
                    {item.label}
                    {badge(to) > 0 && <span className="absolute right-[22%] top-1.5 size-2 rounded-full bg-amber-500" />}
                  </>
                )}
              </NavLink>
            )
          })}
          <button type="button" onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-road-500">
            <span className="flex h-7 w-12 items-center justify-center">
              <Ellipsis className="size-5" />
            </span>
            More
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy-950/50" onClick={() => setMoreOpen(false)} aria-hidden />
          <div className="absolute inset-x-0 bottom-0 animate-slide-up rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy-900">{actor.name}</p>
                <p className="text-xs text-road-500">
                  {actor.roleLabel} · {actor.carrier.legalName}
                </p>
              </div>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 text-road-500 hover:bg-road-100">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {nav
                .filter((n) => !MOBILE_TABS.includes(n.to))
                .map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className="relative flex flex-col items-center gap-1.5 rounded-xl bg-road-50 py-4 text-xs font-semibold text-navy-900 ring-1 ring-road-200">
                    <Icon className="size-5 text-navy-700" />
                    {label}
                    {badge(to) > 0 && <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-navy-950">{badge(to)}</span>}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
