import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true, createdAt: true, updatedAt: true }
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { email, password, fullName, role, isActive } = body

  const data: any = {}
  if (email !== undefined) data.email = email
  if (fullName !== undefined) data.fullName = fullName || null
  if (role !== undefined) data.role = role
  if (isActive !== undefined) data.isActive = isActive
  if (password) data.password = password

  const user = await prisma.adminUser.update({
    where: { id },
    data,
    select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true, createdAt: true, updatedAt: true }
  })

  await prisma.systemLog.create({
    data: { action: 'UPDATE_ADMIN_USER', target: id, details: `Updated admin user ${user.username}` }
  })

  return NextResponse.json(user)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.adminUser.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.adminUser.delete({ where: { id } })

  await prisma.systemLog.create({
    data: { action: 'DELETE_ADMIN_USER', target: id, details: `Deleted admin user ${user.username}` }
  })

  return NextResponse.json({ success: true })
}
