import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET() {
  const routers = await prisma.hotspotRouter.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      username: true,
      useHttps: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
      // password intentionally excluded
    }
  })

  return NextResponse.json(routers)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, host, port, username, password, useHttps } = body

  if (!name || !host || !username || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const router = await prisma.hotspotRouter.create({
    data: { name, host, port: port ?? 8728, username, password, useHttps: useHttps ?? false }
  })

  return NextResponse.json({ id: router.id, name: router.name, host: router.host }, { status: 201 })
}
