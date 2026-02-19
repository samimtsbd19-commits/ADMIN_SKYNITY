import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, range, routerId } = body

  const data: any = {}
  if (name !== undefined) data.name = name
  if (range !== undefined) data.range = range
  if (routerId !== undefined) data.routerId = routerId

  const pool = await prisma.ipPool.update({
    where: { id },
    data,
    include: { router: { select: { id: true, name: true } } }
  })

  await prisma.systemLog.create({
    data: { action: 'UPDATE_IP_POOL', target: id, details: `Updated IP pool ${pool.name}` }
  })

  return NextResponse.json(pool)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pool = await prisma.ipPool.findUnique({ where: { id } })
  if (!pool) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.ipPool.delete({ where: { id } })

  await prisma.systemLog.create({
    data: { action: 'DELETE_IP_POOL', target: id, details: `Deleted IP pool ${pool.name}` }
  })

  return NextResponse.json({ success: true })
}
