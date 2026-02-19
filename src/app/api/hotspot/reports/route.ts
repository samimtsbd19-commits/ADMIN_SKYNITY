import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'revenue'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const dateFilter: any = {}
  if (from) dateFilter.gte = new Date(from)
  if (to) dateFilter.lte = new Date(to)

  if (type === 'revenue') {
    // Revenue per day
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'Paid',
        ...(from || to ? { createdAt: dateFilter } : {})
      },
      select: { createdAt: true, amount: true, paymentMethod: true },
      orderBy: { createdAt: 'asc' }
    })

    // Group by date
    const byDate: Record<string, number> = {}
    for (const tx of transactions) {
      const day = tx.createdAt.toISOString().slice(0, 10)
      byDate[day] = (byDate[day] || 0) + tx.amount
    }

    const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0)
    const totalTransactions = transactions.length

    // Payment method breakdown
    const byMethod: Record<string, number> = {}
    for (const tx of transactions) {
      byMethod[tx.paymentMethod] = (byMethod[tx.paymentMethod] || 0) + tx.amount
    }

    return NextResponse.json({
      type: 'revenue',
      totalRevenue,
      totalTransactions,
      byDate: Object.entries(byDate).map(([date, total]) => ({ date, total })),
      byMethod: Object.entries(byMethod).map(([method, total]) => ({ method, total }))
    })
  }

  if (type === 'activation') {
    // New customers per day
    const customers = await prisma.customer.findMany({
      where: from || to ? { createdAt: dateFilter } : {},
      select: { createdAt: true, serviceType: true, planId: true },
      orderBy: { createdAt: 'asc' }
    })

    const byDate: Record<string, number> = {}
    for (const c of customers) {
      const day = c.createdAt.toISOString().slice(0, 10)
      byDate[day] = (byDate[day] || 0) + 1
    }

    const statusCounts = await prisma.customer.groupBy({
      by: ['status'],
      _count: true
    })

    return NextResponse.json({
      type: 'activation',
      totalCustomers: customers.length,
      byDate: Object.entries(byDate).map(([date, count]) => ({ date, count })),
      byStatus: statusCounts.map(s => ({ status: s.status, count: s._count }))
    })
  }

  return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
}
