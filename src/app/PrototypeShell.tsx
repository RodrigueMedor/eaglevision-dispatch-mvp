import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Ellipsis, Monitor, RotateCcw, Smartphone, Tablet } from 'lucide-react'
import type { PortalRole, StaffRole } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { setSession } from '@/services/commands'
import { ROLE_LABEL } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import { useToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { LogoMark } from '@/components/brand/Logo'
import { AppRoutes } from './AppRoutes'
import { isEmbedded, ROUTE_MESSAGE } from './embed'

type Device = 'desktop' | 'tablet' | 'mobile'

const DEVICES: Record<Device, { label: string; width: number; height: number; icon: typeof Monitor }> = {
  desktop: { label: 'Desktop', width: 0, height: 0, icon: Monitor },
  tablet: { label: 'Tablet', width: 820, height: 1180, icon: Tablet },
  mobile: { label: 'Mobile', width: 390, height: 844, icon: Smartphone },
}

const AREAS = [
  { id: 'brief', label: 'Brief', to: '/brief', match: (p: string) => p.startsWith('/brief') },
  { id: 'public', label: 'Public Website', to: '/', match: (p: string) => !/^\/(brief|portal|admin|design-system)/.test(p) },
  { id: 'portal', label: 'Carrier Portal', to: '/portal', match: (p: string) => p.startsWith('/portal') },
  { id: 'admin', label: 'Admin / Dispatch', to: '/admin', match: (p: string) => p.startsWith('/admin') },
  { id: 'design', label: 'Design System', to: '/design-system', match: (p: string) => p.startsWith('/design-system') },
]

const STAFF_ROLES: StaffRole[] = ['super-admin', 'admin', 'dispatcher', 'accounting', 'support']
const PORTAL_ROLES: PortalRole[] = ['carrier', 'driver']

const BAR_HEIGHT = 48

function readDevice(): Device {
  try {
    const d = sessionStorage.getItem('evd-device')
    if (d === 'tablet' || d === 'mobile') return d
  } catch {
    /* ignore */
  }
  return 'desktop'
}

/**
 * Prototype chrome (like the TurboBolton MVP): area tabs, device preview,
 * role switcher and demo reset. Inside the preview iframe it renders only the app.
 */
export function PrototypeShell() {
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--proto-h', isEmbedded ? '0px' : `${BAR_HEIGHT}px`)
  }, [])

  if (isEmbedded) return <EmbeddedApp />
  return <TopLevel />
}

function EmbeddedApp() {
  const location = useLocation()
  useEffect(() => {
    window.parent.postMessage({ type: ROUTE_MESSAGE, path: location.pathname + location.search }, window.location.origin)
  }, [location.pathname, location.search])
  return <AppRoutes />
}

function TopLevel() {
  const [device, setDeviceState] = useState<Device>(readDevice)
  const setDevice = (d: Device) => {
    setDeviceState(d)
    try {
      sessionStorage.setItem('evd-device', d)
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <PrototypeBar device={device} setDevice={setDevice} />
      {device === 'desktop' ? <AppRoutes /> : <DevicePreview device={device} />}
    </>
  )
}

function PrototypeBar({ device, setDevice }: { device: Device; setDevice: (d: Device) => void }) {
  const { pathname } = useLocation()
  const { state, update, reset } = useDemo()
  const toast = useToast()
  const [confirmReset, setConfirmReset] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const area = AREAS.find((a) => a.match(pathname))?.id

  const roleControl =
    area === 'admin' ? (
      <RoleSelect
        value={state.session.staffRole}
        options={STAFF_ROLES}
        onChange={(role) => {
          const user = state.users.find((u) => u.role === role && u.status === 'active')
          update((s) => setSession(s, { staffRole: role as StaffRole, staffUserId: user?.id ?? s.session.staffUserId }))
          toast({ title: `Viewing as ${ROLE_LABEL[role as StaffRole]}`, description: 'Navigation and actions now reflect this role’s permissions.', tone: 'info' })
        }}
      />
    ) : area === 'portal' ? (
      <RoleSelect
        value={state.session.portalRole}
        options={PORTAL_ROLES}
        onChange={(role) => {
          update((s) => setSession(s, { portalRole: role as PortalRole }))
          toast({ title: `Viewing as ${ROLE_LABEL[role as PortalRole]}`, description: role === 'driver' ? 'Drivers only see their assigned loads, documents and messages.' : 'Full owner-operator access.', tone: 'info' })
        }}
      />
    ) : null

  return (
    <>
      <header className="sticky top-0 z-[90] flex h-12 items-center gap-2 border-b border-white/10 bg-navy-950 px-2 text-white sm:px-3" style={{ height: BAR_HEIGHT }}>
        <Link to="/brief" className="flex shrink-0 items-center gap-2 pr-1" title="Eagle Vision Dispatch — MVP Prototype">
          <LogoMark className="size-7" />
          <span className="hidden flex-col leading-none xl:flex">
            <span className="font-condensed text-sm font-bold uppercase tracking-wide">Eagle Vision Dispatch</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">MVP Prototype</span>
          </span>
        </Link>

        <nav aria-label="Prototype areas" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-thin">
          {AREAS.map((a) => (
            <Link
              key={a.id}
              to={a.to}
              aria-current={area === a.id ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors sm:px-3',
                area === a.id ? 'bg-amber-500 text-navy-950' : 'text-navy-200 hover:bg-white/10 hover:text-white',
              )}
            >
              {a.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {roleControl}
          <div className="flex rounded-md bg-white/10 p-0.5" role="group" aria-label="Device preview">
            {(Object.keys(DEVICES) as Device[]).map((d) => {
              const Icon = DEVICES[d].icon
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  aria-pressed={device === d}
                  title={`${DEVICES[d].label} preview`}
                  className={cn('flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition-colors', device === d ? 'bg-white text-navy-950' : 'text-navy-200 hover:text-white')}
                >
                  <Icon className="size-3.5" /> <span className="hidden 2xl:inline">{DEVICES[d].label}</span>
                </button>
              )
            })}
          </div>
          <span className="rounded border border-dashed border-amber-400/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">Sample data</span>
          <button type="button" onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-navy-200 hover:bg-white/10 hover:text-white">
            <RotateCcw className="size-3.5" /> Reset demo
          </button>
        </div>

        <div className="relative lg:hidden">
          <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Prototype options" className="flex size-8 items-center justify-center rounded-md text-navy-200 hover:bg-white/10">
            <Ellipsis className="size-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[91]" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-10 z-[92] w-64 space-y-3 rounded-xl border border-white/10 bg-navy-900 p-3 shadow-2xl">
                {roleControl && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-300">Viewing as</p>
                    {roleControl}
                  </div>
                )}
                <p className="text-xs text-navy-300">Device previews are available on larger screens. You are already seeing the mobile layout.</p>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setConfirmReset(true)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold"
                >
                  <RotateCcw className="size-4" /> Reset demo data
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo?"
        description="Restores all sample carriers, loads, documents and messages to their original state."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              icon={<RotateCcw className="size-4" />}
              onClick={() => {
                reset()
                setConfirmReset(false)
                toast({ title: 'Demo reset', description: 'All sample data has been restored.' })
              }}
            >
              Reset demo
            </Button>
          </>
        }
      >
        <p className="text-sm text-road-600">Anything created during this session — new applications, loads, uploads or messages — will be cleared. This only affects your browser.</p>
      </Modal>
    </>
  )
}

function RoleSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      aria-label="Viewing as role"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-md border border-white/15 bg-navy-900 px-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 lg:w-auto"
    >
      {options.map((r) => (
        <option key={r} value={r}>
          Role: {ROLE_LABEL[r as StaffRole | PortalRole]}
        </option>
      ))}
    </select>
  )
}

/**
 * Tablet/mobile preview. The app is loaded in a same-origin iframe at the real
 * device width, so actual responsive breakpoints apply (not a scaled screenshot).
 */
function DevicePreview({ device }: { device: Exclude<Device, 'desktop'> }) {
  const location = useLocation()
  const navigate = useNavigate()
  const current = location.pathname + location.search
  const [src] = useState(current)
  const frame = useRef<HTMLIFrameElement>(null)
  const fromFrame = useRef<string | null>(null)
  const { width, height } = DEVICES[device]

  // Navigation inside the iframe is mirrored to the outer URL (so tabs stay in sync)
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== ROUTE_MESSAGE) return
      const path = String(e.data.path)
      fromFrame.current = path
      if (path !== window.location.pathname + window.location.search) navigate(path, { replace: true })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate])

  // Navigation from the prototype bar reloads the iframe at the new path
  useEffect(() => {
    if (fromFrame.current === current) return
    fromFrame.current = null
    const win = frame.current?.contentWindow
    if (win && win.location.pathname + win.location.search !== current) win.location.replace(current)
  }, [current])

  return (
    <div className="flex min-h-[calc(100dvh-48px)] items-start justify-center overflow-auto bg-[radial-gradient(circle_at_top,#1f3655,#06101d_70%)] p-6">
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-300">
          {DEVICES[device].label} preview · {width}px
        </p>
        <div
          className={cn('overflow-hidden bg-black shadow-2xl ring-1 ring-white/10', device === 'mobile' ? 'rounded-[44px] p-3' : 'rounded-[28px] p-4')}
          style={{ width: width + (device === 'mobile' ? 24 : 32) }}
        >
          <iframe
            key={device}
            ref={frame}
            title={`${DEVICES[device].label} preview`}
            src={src}
            className={cn('block w-full bg-white', device === 'mobile' ? 'rounded-[32px]' : 'rounded-[14px]')}
            style={{ height: Math.min(height, Math.max(560, window.innerHeight - 140)) }}
          />
        </div>
      </div>
    </div>
  )
}
