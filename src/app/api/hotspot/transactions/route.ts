import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: any = {}
  if (customerId) where.customerId = customerId
  if (status) where.status = status
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      customer: { select: { id: true, username: true, fullName: true } },
      plan: { select: { id: true, name: true, price: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return NextResponse.json(transactions)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { customerId, planId, amount, paymentMethod, status, note, createdBy, expiresAt } = body

  if (!customerId || amount === undefined) {
    return NextResponse.json({ error: 'customerId and amount are required' }, { status: 400 })
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  const transaction = await prisma.transaction.create({
    data: {
      customerId,
      planId: planId || null,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      status: status || 'Paid',
      note: note || null,
      createdBy: createdBy || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    },
    include: {
      customer: { select: { id: true, username: true, fullName: true } },
      plan: { select: { id: true, name: true, price: true } }
    }
  })

  // If paid and planId, assign plan to customer
  if (transaction.status === 'Paid' && planId) {
    await prisma.customer.update({ where: { id: customerId }, data: { planId } })
  }

  // If payment method is Balance, deduct from wallet
  if (paymentMethod === 'Balance') {
    await prisma.customer.update({
      where: { id: customerId },
      data: { balance: { decrement: amount } }
    })
  }

  await prisma.systemLog.create({
    data: { action: 'CREATE_TRANSACTION', target: transaction.id, details: `Transaction $${amount} for customer ${customer.username}` }
  })

  return NextResponse.json(transaction, { status: 201 })
}
