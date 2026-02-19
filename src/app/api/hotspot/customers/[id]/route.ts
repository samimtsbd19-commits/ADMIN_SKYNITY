import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      plan: true,
      router: { select: { id: true, name: true } },
      transactions: { orderBy: { createdAt: 'desc' }, take: 20 }
    }
  })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(customer)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { username, password, fullName, email, phone, address, city, serviceType, accountType, status, balance, autoRenew, planId, routerId } = body

  const data: any = {}
  if (fullName !== undefined) data.fullName = fullName
  if (email !== undefined) data.email = email || null
  if (phone !== undefined) data.phone = phone || null
  if (address !== undefined) data.address = address || null
  if (city !== undefined) data.city = city || null
  if (serviceType !== undefined) data.serviceType = serviceType
  if (accountType !== undefined) data.accountType = accountType
  if (status !== undefined) data.status = status
  if (balance !== undefined) data.balance = balance
  if (autoRenew !== undefined) data.autoRenew = autoRenew
  if (planId !== undefined) data.planId = planId || null
  if (routerId !== undefined) data.routerId = routerId || null
  if (password) data.password = password

  const customer = await prisma.customer.update({
    where: { id },
    data,
    include: {
      plan: { select: { id: true, name: true, price: true, rateLimit: true } },
      router: { select: { id: true, name: true } }
    }
  })

  await prisma.systemLog.create({
    data: { action: 'UPDATE_CUSTOMER', target: id, details: `Updated customer ${customer.username}` }
  })

  return NextResponse.json(customer)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({ where: { id } })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.customer.delete({ where: { id } })

  await prisma.systemLog.create({
    data: { action: 'DELETE_CUSTOMER', target: id, details: `Deleted customer ${customer.username}` }
  })

  return NextResponse.json({ success: true })
}
