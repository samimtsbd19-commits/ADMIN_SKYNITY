/**
 * MikroTik Hotspot API helpers
 * Wraps RouterOS REST endpoints for hotspot management
 */

import type { MikroTikClient } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RosHotspotUser {
  '.id': string
  name: string
  password?: string
  profile?: string
  'mac-address'?: string
  'ip-address'?: string
  'limit-uptime'?: string
  'limit-bytes-total'?: string
  comment?: string
  disabled?: string // "true" | "false"
}

export interface RosHotspotActive {
  '.id': string
  user: string
  address: string
  'mac-address': string
  'login-by': string
  uptime: string
  'bytes-in': string
  'bytes-out': string
  'packets-in': string
  'packets-out': string
  server: string
  'session-time-left'?: string
}

export interface RosHotspotProfile {
  '.id': string
  name: string
  'rate-limit'?: string
  'shared-users'?: string
  'session-timeout'?: string
  'idle-timeout'?: string
  'address-pool'?: string
}

export interface RosSystemResource {
  'cpu-load': string
  'free-memory': string
  'total-memory': string
  uptime: string
  version: string
  'board-name': string
  'platform': string
}

// ─── Hotspot Users ────────────────────────────────────────────────────────────

export async function getHotspotUsers(client: MikroTikClient): Promise<RosHotspotUser[]> {
  return client.get('/ip/hotspot/user')
}

export async function createHotspotUser(
  client: MikroTikClient,
  data: Partial<RosHotspotUser>
): Promise<RosHotspotUser> {
  return client.post('/ip/hotspot/user', data)
}

export async function updateHotspotUser(
  client: MikroTikClient,
  id: string,
  data: Partial<RosHotspotUser>
): Promise<RosHotspotUser> {
  return client.patch('/ip/hotspot/user', id, data)
}

export async function deleteHotspotUser(client: MikroTikClient, id: string): Promise<void> {
  return client.remove('/ip/hotspot/user', id)
}

export async function disableHotspotUser(client: MikroTikClient, id: string, disabled: boolean): Promise<void> {
  await client.patch('/ip/hotspot/user', id, { disabled: disabled ? 'true' : 'false' })
}

// ─── Active Sessions ──────────────────────────────────────────────────────────

export async function getActiveSessions(client: MikroTikClient): Promise<RosHotspotActive[]> {
  return client.get('/ip/hotspot/active')
}

export async function disconnectSession(client: MikroTikClient, id: string): Promise<void> {
  return client.remove('/ip/hotspot/active', id)
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getHotspotProfiles(client: MikroTikClient): Promise<RosHotspotProfile[]> {
  return client.get('/ip/hotspot/user/profile')
}

export async function createHotspotProfile(
  client: MikroTikClient,
  data: Partial<RosHotspotProfile>
): Promise<RosHotspotProfile> {
  return client.post('/ip/hotspot/user/profile', data)
}

export async function updateHotspotProfile(
  client: MikroTikClient,
  id: string,
  data: Partial<RosHotspotProfile>
): Promise<RosHotspotProfile> {
  return client.patch('/ip/hotspot/user/profile', id, data)
}

export async function deleteHotspotProfile(client: MikroTikClient, id: string): Promise<void> {
  return client.remove('/ip/hotspot/user/profile', id)
}

// ─── System Stats ─────────────────────────────────────────────────────────────

export async function getSystemResource(client: MikroTikClient): Promise<RosSystemResource> {
  const res = await client.get<any>('/system/resource')
  return Array.isArray(res) ? res[0] : res
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse RouterOS uptime string (e.g. "1d2h3m4s") to seconds */
export function parseUptime(uptime: string): number {
  let seconds = 0
  const days = uptime.match(/(\d+)d/)
  const hours = uptime.match(/(\d+)h/)
  const mins = uptime.match(/(\d+)m/)
  const secs = uptime.match(/(\d+)s/)
  if (days) seconds += parseInt(days[1]) * 86400
  if (hours) seconds += parseInt(hours[1]) * 3600
  if (mins) seconds += parseInt(mins[1]) * 60
  if (secs) seconds += parseInt(secs[1])
  return seconds
}

/** Format bytes to human-readable (KB, MB, GB) */
export function formatBytes(bytes: number | string): string {
  const n = typeof bytes === 'string' ? parseInt(bytes) : bytes
  if (isNaN(n)) return '0 B'
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`
  return `${(n / 1073741824).toFixed(2)} GB`
}
