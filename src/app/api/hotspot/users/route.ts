import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { createHotspotUser } from '@/libs/mikrotik/hotspot'

/** Serialize Prisma result — converts BigInt to number for JSON transport */
function serializeUser(user: any) {
  return { ...user, limitBytes: user.limitBytes !== null ? Number(user.limitBytes) : null }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const routerId = searchParams.get('routerId')

  if (!routerId) {
    return NextResponse.json({ error: 'routerId is required' }, { status: 400 })
  }

  const users = await prisma.hotspotUser.findMany({
    where: { routerId },
    include: { profile: { select: { name: true, rateLimit: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(users.map(serializeUser))
}

export async function POST(req: Request) {
  const body = await req.json()
  const { routerId, username, password, profileId, macAddress, ipAddress, limitUptime, limitBytes, comment } = body

  if (!routerId || !username || !password) {
    return NextResponse.json({ error: 'routerId, username and password are required' }, { status: 400 })
  }

  const router = await prisma.hotspotRouter.findUnique({ where: { id: routerId } })
  if (!router) return NextResponse.json({ error: 'Router not found' }, { status: 404 })

  let profileName: string | undefined
  if (profileId) {
    const profile = await prisma.hotspotProfile.findUnique({ where: { id: profileId } })
    profileName = profile?.name
  }

  // Create on RouterOS
  const client = clientFromRouter(router)
  const rosUser = await createHotspotUser(client, {
    name: username,
    password,
    ...(profileName && { profile: profileName }),
    ...(macAddress && { 'mac-address': macAddress }),
    ...(ipAddress && { 'ip-address': ipAddress }),
    ...(limitUptime && { 'limit-uptime': limitUptime }),
    ...(limitBytes && { 'limit-bytes-total': String(limitBytes) }),
    ...(comment && { comment })
  })

  // Save to DB
  const user = await prisma.hotspotUser.create({
    data: {
      routerId,
      profileId: profileId || null,
      mikrotikId: rosUser['.id'],
      username,
      password,
      macAddress: macAddress || null,
      ipAddress: ipAddress || null,
      limitUptime: limitUptime || null,
      limitBytes: limitBytes ? BigInt(limitBytes) : null,
      comment: comment || null
    }
  })

  return NextResponse.json(serializeUser(user), { status: 201 })
}
