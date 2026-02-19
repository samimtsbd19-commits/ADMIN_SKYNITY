import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { getActiveSessions } from '@/libs/mikrotik/hotspot'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const routerId = searchParams.get('routerId')

  // DB stats (always available)
  const [totalUsers, totalVouchers, usedVouchers] = await Promise.all([
    prisma.hotspotUser.count({ where: routerId ? { routerId } : {} }),
    prisma.hotspotVoucher.count({ where: routerId ? { routerId } : {} }),
    prisma.hotspotVoucher.count({ where: { ...(routerId ? { routerId } : {}), usedAt: { not: null } } })
  ])

  // Live stats from RouterOS (if router configured)
  let onlineUsers = 0
  let totalDownload = 0
  let totalUpload = 0

  if (routerId) {
    try {
      const router = await prisma.hotspotRouter.findUnique({ where: { id: routerId } })
      if (router) {
        const client = clientFromRouter(router)
        const sessions = await getActiveSessions(client)
        onlineUsers = sessions.length
        totalDownload = sessions.reduce((sum, s) => sum + parseInt(s['bytes-in'] || '0'), 0)
        totalUpload = sessions.reduce((sum, s) => sum + parseInt(s['bytes-out'] || '0'), 0)
      }
    } catch {
      // Router unreachable — return DB stats only
    }
  }

  return NextResponse.json({
    totalUsers,
    onlineUsers,
    totalVouchers,
    usedVouchers,
    activeVouchers: totalVouchers - usedVouchers,
    totalDownload,
    totalUpload
  })
}
