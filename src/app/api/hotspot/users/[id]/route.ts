import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { updateHotspotUser, deleteHotspotUser } from '@/libs/mikrotik/hotspot'

function serializeUser(user: any) {
  return { ...user, limitBytes: user.limitBytes !== null ? Number(user.limitBytes) : null }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const user = await prisma.hotspotUser.findUnique({ where: { id }, include: { router: true } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { username, password, profileId, macAddress, ipAddress, limitUptime, limitBytes, comment, disabled } = body

  let profileName: string | undefined
  if (profileId) {
    const profile = await prisma.hotspotProfile.findUnique({ where: { id: profileId } })
    profileName = profile?.name
  }

  // Update on RouterOS if we have the mikrotikId
  if (user.mikrotikId) {
    const client = clientFromRouter(user.router)
    await updateHotspotUser(client, user.mikrotikId, {
      ...(username && { name: username }),
      ...(password && { password }),
      ...(profileName && { profile: profileName }),
      ...(macAddress !== undefined && { 'mac-address': macAddress }),
      ...(ipAddress !== undefined && { 'ip-address': ipAddress }),
      ...(limitUptime !== undefined && { 'limit-uptime': limitUptime }),
      ...(limitBytes !== undefined && { 'limit-bytes-total': String(limitBytes) }),
      ...(comment !== undefined && { comment }),
      ...(disabled !== undefined && { disabled: disabled ? 'true' : 'false' })
    })
  }

  // Update in DB
  const updated = await prisma.hotspotUser.update({
    where: { id },
    data: {
      ...(username && { username }),
      ...(password && { password }),
      ...(profileId !== undefined && { profileId }),
      ...(macAddress !== undefined && { macAddress }),
      ...(ipAddress !== undefined && { ipAddress }),
      ...(limitUptime !== undefined && { limitUptime }),
      ...(limitBytes !== undefined && { limitBytes: limitBytes ? BigInt(limitBytes) : null }),
      ...(comment !== undefined && { comment }),
      ...(disabled !== undefined && { disabled })
    },
    include: { profile: { select: { name: true, rateLimit: true } } }
  })

  return NextResponse.json(serializeUser(updated))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.hotspotUser.findUnique({ where: { id }, include: { router: true } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete from RouterOS
  if (user.mikrotikId) {
    const client = clientFromRouter(user.router)
    await deleteHotspotUser(client, user.mikrotikId)
  }

  await prisma.hotspotUser.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
