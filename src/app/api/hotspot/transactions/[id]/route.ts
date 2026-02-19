import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, note, paymentMethod, amount, expiresAt } = body

  const data: any = {}
  if (status !== undefined) data.status = status
  if (note !== undefined) data.note = note || null
  if (paymentMethod !== undefined) data.paymentMethod = paymentMethod
  if (amount !== undefined) data.amount = amount
  if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null

  const transaction = await prisma.transaction.update({
    where: { id },
    data,
    include: {
      customer: { select: { id: true, username: true, fullName: true } },
      plan: { select: { id: true, name: true, price: true } }
    }
  })

  await prisma.systemLog.create({
    data: { action: 'UPDATE_TRANSACTION', target: id, details: `Updated transaction status to ${transaction.status}` }
  })

  return NextResponse.json(transaction)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tx = await prisma.transaction.findUnique({ where: { id } })
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.transaction.delete({ where: { id } })

  await prisma.systemLog.create({
    data: { action: 'DELETE_TRANSACTION', target: id, details: `Deleted transaction` }
  })

  return NextResponse.json({ success: true })
}
