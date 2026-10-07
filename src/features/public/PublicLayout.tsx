import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronDown, Mail, Menu, Phone, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { Button } from '@/components/ui/Button'
import { EQUIPMENT } from '@/lib/equipment'
import { cn } from '@/lib/cn'
import { CONTACT } from './content'

const NAV = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-[calc(100dvh-var(--proto-h))] flex-col bg-white">
      <div className="hidden bg-navy-950 text-xs text-navy-200 md:block">
        <div className="container-page flex h-9 items-center justify-between">
          <span>24/7 support for active loads · Dispatching carriers across the lower 48</span>
          <div className="flex items-center gap-5">
            <a href={`tel:${CONTACT.phone}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Phone className="size-3.5" /> {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Mail className="size-3.5" /> {CONTACT.email}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-[var(--proto-h)] z-40 border-b border-road-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" aria-label="Eagle Vision Dispatch home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            <div className="relative" onMouseLeave={() => setServicesOpen(false)}>
              <button
                type="button"
                onClick={() => setServicesOpen((o) => !o)}
                onMouseEnter={() => setServicesOpen(true)}
                aria-expanded={servicesOpen}
                className={cn('inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold', pathname.startsWith('/services') ? 'text-navy-900' : 'text-road-600 hover:text-navy-900')}
              >
                Services <ChevronDown className="size-4" />
              </button>
              {servicesOpen && (
                <div className="absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-2">
                  <div className="grid grid-cols-2 gap-1 rounded-2xl border border-road-200 bg-white p-2 shadow-lift">
                    {EQUIPMENT.map((e) => (
                      <Link key={e.slug} to={`/services/${e.slug}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-road-50">
                        <span className="w-14 shrink-0">
                          <EquipmentGlyph type={e.type} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-navy-900">
                            {e.label}
                            {e.featured && <span className="ml-1.5 rounded bg-amber-100 px-1 py-px text-[10px] font-bold uppercase text-amber-800">Specialty</span>}
                          </span>
                          <span className="block text-xs text-road-500">{e.short}</span>
                        </span>
                      </Link>
                    ))}
                    <Link to="/services" className="col-span-2 rounded-xl bg-navy-50 p-2.5 text-center text-sm font-semibold text-navy-800 hover:bg-navy-100">
                      View all dispatch services →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold', isActive ? 'text-navy-900' : 'text-road-600 hover:text-navy-900')}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button to="/portal" variant="ghost" size="sm">
              Carrier Login
            </Button>
            <Button to="/get-started" variant="accent" size="sm">
              Get Started
            </Button>
          </div>

          <button type="button" className="rounded-lg p-2 text-navy-900 lg:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Open menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="max-h-[calc(100dvh-var(--proto-h)-4rem)] overflow-y-auto border-t border-road-200 bg-white lg:hidden">
            <div className="container-page space-y-1 py-4">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-road-500">Dispatch services</p>
              <div className="grid grid-cols-2 gap-1">
                {EQUIPMENT.map((e) => (
                  <Link key={e.slug} to={`/services/${e.slug}`} className="rounded-lg px-3 py-2 text-sm font-medium text-navy-900 hover:bg-road-50">
                    {e.label}
                  </Link>
                ))}
              </div>
              <div className="my-2 border-t border-road-100" />
              {[{ to: '/services', label: 'All Services' }, ...NAV].map((n) => (
                <Link key={n.to} to={n.to} className="block rounded-lg px-3 py-2.5 text-base font-semibold text-navy-900 hover:bg-road-50">
                  {n.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Button to="/portal" variant="outline">
                  Carrier Login
                </Button>
                <Button to="/get-started" variant="accent">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  )
}

function PublicFooter() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="road-stripe h-1 opacity-80" aria-hidden />
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo inverse />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Professional truck dispatching for owner-operators and small fleets. We keep your truck moving — you focus on driving.
          </p>
          <div className="mt-5 space-y-1.5 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-amber-400" /> {CONTACT.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-amber-400" /> {CONTACT.email}
            </p>
          </div>
        </div>
        <FooterCol title="Equipment" links={EQUIPMENT.map((e) => ({ to: `/services/${e.slug}`, label: e.label }))} />
        <FooterCol
          title="Company"
          links={[
            { to: '/about', label: 'About Us' },
            { to: '/services', label: 'Dispatch Services' },
            { to: '/how-it-works', label: 'How It Works' },
            { to: '/pricing', label: 'Pricing' },
            { to: '/faq', label: 'FAQ' },
            { to: '/contact', label: 'Contact' },
          ]}
        />
        <FooterCol
          title="Carriers"
          links={[
            { to: '/get-started', label: 'Apply Now' },
            { to: '/portal', label: 'Carrier Portal' },
            { to: '/privacy', label: 'Privacy Policy' },
            { to: '/terms', label: 'Terms & Conditions' },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Eagle Vision Dispatch. Prototype for client review — content and data are samples.</p>
          <p>Designed &amp; developed by Eagle Vision Edge LLC</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-condensed text-sm font-semibold uppercase tracking-wider text-white">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-amber-400">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
