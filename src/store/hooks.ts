import { useCallback } from 'react'
import type { DemoState } from '@/data/types'
import { ROLE_LABEL, staffCan, portalCan, type Permission, type PortalPermission } from '@/lib/permissions'
import { useDemo } from './DemoStore'

/** Bind a pure command `(state, ...args) => state` to the store. */
export function useCommand<A extends unknown[]>(fn: (s: DemoState, ...args: A) => DemoState) {
  const { update } = useDemo()
  return useCallback((...args: A) => update((s) => fn(s, ...args)), [update, fn])
}

/** The staff user currently acting in the admin portal. */
export function useStaffActor() {
  const { state } = useDemo()
  const user = state.users.find((u) => u.id === state.session.staffUserId) ?? state.users[0]!
  const role = state.session.staffRole
  return { user, role, roleLabel: ROLE_LABEL[role], can: (p: Permission) => staffCan(role, p) }
}

/** The carrier-portal user (owner-operator or driver). */
export function usePortalActor() {
  const { state } = useDemo()
  const { portalRole, carrierId, driverId } = state.session
  const carrier = state.carriers.find((c) => c.id === carrierId) ?? state.carriers[0]!
  const driver = state.drivers.find((d) => d.id === driverId)
  const name = portalRole === 'driver' ? (driver?.name ?? 'Driver') : carrier.ownerName
  return { carrier, driver, role: portalRole, name, roleLabel: ROLE_LABEL[portalRole], can: (p: PortalPermission) => portalCan(portalRole, p) }
}
