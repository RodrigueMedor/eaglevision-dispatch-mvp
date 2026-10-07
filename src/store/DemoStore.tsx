import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DemoState } from '@/data/types'
import { createSeed, DEMO_STATE_VERSION } from '@/data/seed'

/**
 * Demo store: the whole prototype dataset lives in one state object, persisted to
 * localStorage. The prototype shell and the device-preview iframe share it via the
 * `storage` event, so a role switch or "Reset demo" applies to both instantly.
 *
 * In production this is replaced by API calls (React Query / fetch) against the
 * Spring Boot backend; components only use `useDemo()` + `src/services`.
 */
const STORAGE_KEY = 'evd-demo-state'

type Recipe = (s: DemoState) => DemoState

interface DemoContextValue {
  state: DemoState
  update: (recipe: Recipe) => void
  reset: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed.version === DEMO_STATE_VERSION) return parsed
    }
  } catch {
    // storage unavailable or corrupt — fall back to a fresh seed
  }
  return createSeed()
}

function save(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private-mode errors; the demo still works in memory
  }
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(load)

  useEffect(() => save(state), [state])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        setState(JSON.parse(e.newValue) as DemoState)
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((recipe: Recipe) => setState((s) => recipe(s)), [])
  const reset = useCallback(() => setState(createSeed()), [])

  const value = useMemo(() => ({ state, update, reset }), [state, update, reset])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside <DemoStoreProvider>')
  return ctx
}
