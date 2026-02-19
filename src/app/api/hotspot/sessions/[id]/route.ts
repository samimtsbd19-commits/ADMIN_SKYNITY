import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { disconnectSession } from '@/libs/mikrotik/hotspot'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const routerId = searchParams.get('routerId')

  if (!routerId) return NextResponse.json({ error: 'routerId is required' }, { status: 400 })

  const router = await prisma.hotspotRouter.findUnique({ where: { id: routerId } })
  if (!router) return NextResponse.json({ error: 'Router not found' }, { status: 404 })

  const client = clientFromRouter(router)
  await disconnectSession(client, id)

  return new NextResponse(null, { status: 204 })
}
