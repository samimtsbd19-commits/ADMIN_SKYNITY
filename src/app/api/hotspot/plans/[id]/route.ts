import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

function serializePlan(plan: any) {
  return { ...plan, dataLimit: plan.dataLimit !== null ? Number(plan.dataLimit) : null }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.plan.findUnique({ where: { id } })
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serializePlan(plan))
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, type, price, validity, validityUnit, rateLimit, dataLimit, sharedUsers, autoRenew, isActive, description } = body

  const data: any = {}
  if (name !== undefined) data.name = name
  if (type !== undefined) data.type = type
  if (price !== undefined) data.price = price
  if (validity !== undefined) data.validity = validity
  if (validityUnit !== undefined) data.validityUnit = validityUnit
  if (rateLimit !== undefined) data.rateLimit = rateLimit
  if (dataLimit !== undefined) data.dataLimit = dataLimit ? BigInt(dataLimit) : null
  if (sharedUsers !== undefined) data.sharedUsers = sharedUsers
  if (autoRenew !== undefined) data.autoRenew = autoRenew
  if (isActive !== undefined) data.isActive = isActive
  if (description !== undefined) data.description = description || null

  const plan = await prisma.plan.update({ where: { id }, data })

  await prisma.systemLog.create({
    data: { action: 'UPDATE_PLAN', target: id, details: `Updated plan ${plan.name}` }
  })

  return NextResponse.json(serializePlan(plan))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.plan.findUnique({ where: { id } })
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.plan.delete({ where: { id } })

  await prisma.systemLog.create({
    data: { action: 'DELETE_PLAN', target: id, details: `Deleted plan ${plan.name}` }
  })

  return NextResponse.json({ success: true })
}
