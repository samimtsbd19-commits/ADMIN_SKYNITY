import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET() {
  const users = await prisma.adminUser.findMany({
    select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { username, email, password, fullName, role, isActive } = body

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'username, email and password are required' }, { status: 400 })
  }

  const existing = await prisma.adminUser.findFirst({
    where: { OR: [{ username }, { email }] }
  })
  if (existing) return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 })

  const user = await prisma.adminUser.create({
    data: {
      username,
      email,
      password,
      fullName: fullName || null,
      role: role || 'Admin',
      isActive: isActive ?? true
    },
    select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true, createdAt: true, updatedAt: true }
  })

  await prisma.systemLog.create({
    data: { action: 'CREATE_ADMIN_USER', target: user.id, details: `Created admin user ${username}` }
  })

  return NextResponse.json(user, { status: 201 })
}
