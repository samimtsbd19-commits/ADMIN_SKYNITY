import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const serviceType = searchParams.get('serviceType')

  const where: any = {}
  if (status) where.status = status
  if (serviceType) where.serviceType = serviceType

  const customers = await prisma.customer.findMany({
    where,
    include: {
      plan: { select: { id: true, name: true, price: true, rateLimit: true } },
      router: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(customers)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { username, password, fullName, email, phone, address, city, serviceType, accountType, status, balance, autoRenew, planId, routerId } = body

  if (!username || !password || !fullName) {
    return NextResponse.json({ error: 'username, password and fullName are required' }, { status: 400 })
  }

  const existing = await prisma.customer.findUnique({ where: { username } })
  if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 409 })

  const customer = await prisma.customer.create({
    data: {
      username,
      password,
      fullName,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      serviceType: serviceType || 'Hotspot',
      accountType: accountType || 'Personal',
      status: status || 'Active',
      balance: balance ?? 0,
      autoRenew: autoRenew ?? false,
      planId: planId || null,
      routerId: routerId || null
    },
    include: {
      plan: { select: { id: true, name: true, price: true, rateLimit: true } },
      router: { select: { id: true, name: true } }
    }
  })

  await prisma.systemLog.create({
    data: { action: 'CREATE_CUSTOMER', target: customer.id, details: `Created customer ${username}` }
  })

  return NextResponse.json(customer, { status: 201 })
}
