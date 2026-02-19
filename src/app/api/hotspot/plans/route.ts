import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

function serializePlan(plan: any) {
  return { ...plan, dataLimit: plan.dataLimit !== null ? Number(plan.dataLimit) : null }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const isActive = searchParams.get('isActive')

  const where: any = {}
  if (type) where.type = type
  if (isActive !== null) where.isActive = isActive === 'true'

  const plans = await prisma.plan.findMany({
    where,
    include: { _count: { select: { customers: true, transactions: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(plans.map(serializePlan))
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, type, price, validity, validityUnit, rateLimit, dataLimit, sharedUsers, autoRenew, isActive, description } = body

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const plan = await prisma.plan.create({
    data: {
      name,
      type: type || 'Hotspot',
      price: price ?? 0,
      validity: validity ?? 30,
      validityUnit: validityUnit || 'days',
      rateLimit: rateLimit || '0/0',
      dataLimit: dataLimit ? BigInt(dataLimit) : null,
      sharedUsers: sharedUsers ?? 1,
      autoRenew: autoRenew ?? false,
      isActive: isActive ?? true,
      description: description || null
    }
  })

  await prisma.systemLog.create({
    data: { action: 'CREATE_PLAN', target: plan.id, details: `Created plan ${name}` }
  })

  return NextResponse.json(serializePlan(plan), { status: 201 })
}
