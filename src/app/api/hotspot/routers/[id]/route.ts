import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = await prisma.hotspotRouter.findUnique({ where: { id } })
  if (!router) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { password: _pw, ...safe } = router
  return NextResponse.json(safe)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, host, port, username, password, useHttps, isActive } = body

  const router = await prisma.hotspotRouter.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(host !== undefined && { host }),
      ...(port !== undefined && { port }),
      ...(username !== undefined && { username }),
      ...(password !== undefined && { password }),
      ...(useHttps !== undefined && { useHttps }),
      ...(isActive !== undefined && { isActive })
    }
  })

  const { password: _pw, ...safe } = router
  return NextResponse.json(safe)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.hotspotRouter.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}

/** POST /api/hotspot/routers/[id]/test — test connectivity */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = await prisma.hotspotRouter.findUnique({ where: { id } })
  if (!router) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const client = clientFromRouter(router)
  const result = await client.ping()
  return NextResponse.json(result)
}
