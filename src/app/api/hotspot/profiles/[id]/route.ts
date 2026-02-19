import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { updateHotspotProfile, deleteHotspotProfile } from '@/libs/mikrotik/hotspot'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const profile = await prisma.hotspotProfile.findUnique({ where: { id }, include: { router: true } })
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, rateLimit, sharedUsers, sessionTimeout, idleTimeout, addressPool } = body

  if (profile.mikrotikId) {
    const client = clientFromRouter(profile.router)
    await updateHotspotProfile(client, profile.mikrotikId, {
      ...(name && { name }),
      ...(rateLimit !== undefined && { 'rate-limit': rateLimit }),
      ...(sharedUsers !== undefined && { 'shared-users': String(sharedUsers) }),
      ...(sessionTimeout !== undefined && { 'session-timeout': sessionTimeout }),
      ...(idleTimeout !== undefined && { 'idle-timeout': idleTimeout }),
      ...(addressPool !== undefined && { 'address-pool': addressPool })
    })
  }

  const updated = await prisma.hotspotProfile.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(rateLimit !== undefined && { rateLimit }),
      ...(sharedUsers !== undefined && { sharedUsers }),
      ...(sessionTimeout !== undefined && { sessionTimeout }),
      ...(idleTimeout !== undefined && { idleTimeout }),
      ...(addressPool !== undefined && { addressPool })
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await prisma.hotspotProfile.findUnique({ where: { id }, include: { router: true } })
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (profile.mikrotikId) {
    const client = clientFromRouter(profile.router)
    await deleteHotspotProfile(client, profile.mikrotikId)
  }

  await prisma.hotspotProfile.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
