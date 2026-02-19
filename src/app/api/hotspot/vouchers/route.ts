import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { createHotspotUser } from '@/libs/mikrotik/hotspot'
import { randomBytes } from 'crypto'

function generateCode(length = 8): string {
  return randomBytes(length).toString('base64url').slice(0, length).toUpperCase()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const routerId = searchParams.get('routerId')
  const status = searchParams.get('status') // 'used' | 'unused' | null

  const vouchers = await prisma.hotspotVoucher.findMany({
    where: {
      ...(routerId ? { routerId } : {}),
      ...(status === 'used' ? { usedAt: { not: null } } : {}),
      ...(status === 'unused' ? { usedAt: null } : {})
    },
    include: { profile: { select: { name: true, rateLimit: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(vouchers)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { routerId, profileId, count = 1, expiresAt } = body

  if (!routerId || !profileId) {
    return NextResponse.json({ error: 'routerId and profileId are required' }, { status: 400 })
  }

  const [router, profile] = await Promise.all([
    prisma.hotspotRouter.findUnique({ where: { id: routerId } }),
    prisma.hotspotProfile.findUnique({ where: { id: profileId } })
  ])

  if (!router) return NextResponse.json({ error: 'Router not found' }, { status: 404 })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const client = clientFromRouter(router)
  const codes: string[] = []
  const batchData = []

  for (let i = 0; i < Math.min(count, 100); i++) {
    const code = generateCode()
    codes.push(code)

    // Create voucher as a hotspot user on RouterOS
    await createHotspotUser(client, {
      name: code,
      password: code,
      profile: profile.name,
      comment: `Voucher generated ${new Date().toISOString()}`
    })

    batchData.push({
      routerId,
      profileId,
      code,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    })
  }

  const vouchers = await prisma.hotspotVoucher.createMany({ data: batchData })

  return NextResponse.json({ created: vouchers.count, codes }, { status: 201 })
}
