import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const routerId = searchParams.get('routerId')

  const pools = await prisma.ipPool.findMany({
    where: routerId ? { routerId } : {},
    include: { router: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(pools)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, range, routerId } = body

  if (!name || !range || !routerId) {
    return NextResponse.json({ error: 'name, range and routerId are required' }, { status: 400 })
  }

  const router = await prisma.hotspotRouter.findUnique({ where: { id: routerId } })
  if (!router) return NextResponse.json({ error: 'Router not found' }, { status: 404 })

  const pool = await prisma.ipPool.create({
    data: { name, range, routerId },
    include: { router: { select: { id: true, name: true } } }
  })

  await prisma.systemLog.create({
    data: { action: 'CREATE_IP_POOL', target: pool.id, details: `Created IP pool ${name} (${range})` }
  })

  return NextResponse.json(pool, { status: 201 })
}
