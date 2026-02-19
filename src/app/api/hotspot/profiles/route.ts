import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { getHotspotProfiles, createHotspotProfile } from '@/libs/mikrotik/hotspot'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const routerId = searchParams.get('routerId')

  if (!routerId) return NextResponse.json({ error: 'routerId is required' }, { status: 400 })

  const profiles = await prisma.hotspotProfile.findMany({
    where: { routerId },
    include: { _count: { select: { users: true, vouchers: true } } },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(profiles)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { routerId, name, rateLimit, sharedUsers, sessionTimeout, idleTimeout, addressPool } = body

  if (!routerId || !name) {
    return NextResponse.json({ error: 'routerId and name are required' }, { status: 400 })
  }

  const router = await prisma.hotspotRouter.findUnique({ where: { id: routerId } })
  if (!router) return NextResponse.json({ error: 'Router not found' }, { status: 404 })

  // Create on RouterOS
  const client = clientFromRouter(router)
  const rosProfile = await createHotspotProfile(client, {
    name,
    ...(rateLimit && { 'rate-limit': rateLimit }),
    ...(sharedUsers && { 'shared-users': String(sharedUsers) }),
    ...(sessionTimeout && { 'session-timeout': sessionTimeout }),
    ...(idleTimeout && { 'idle-timeout': idleTimeout }),
    ...(addressPool && { 'address-pool': addressPool })
  })

  // Save to DB
  const profile = await prisma.hotspotProfile.create({
    data: {
      routerId,
      mikrotikId: rosProfile['.id'],
      name,
      rateLimit: rateLimit || '0/0',
      sharedUsers: sharedUsers || 1,
      sessionTimeout: sessionTimeout || null,
      idleTimeout: idleTimeout || null,
      addressPool: addressPool || null
    }
  })

  return NextResponse.json(profile, { status: 201 })
}
