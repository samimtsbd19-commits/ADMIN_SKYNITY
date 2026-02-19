import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { clientFromRouter } from '@/libs/mikrotik/client'
import { deleteHotspotUser } from '@/libs/mikrotik/hotspot'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const voucher = await prisma.hotspotVoucher.findUnique({
    where: { id },
    include: { router: true }
  })
  if (!voucher) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Try to remove from RouterOS (voucher was created as a hotspot user with the code as username)
  try {
    const client = clientFromRouter(voucher.router)
    // Find the user by name on RouterOS to get the .id
    const users = await client.get<any[]>(`/ip/hotspot/user?name=${voucher.code}`)
    if (users && users.length > 0) {
      await deleteHotspotUser(client, users[0]['.id'])
    }
  } catch {
    // Non-fatal — remove from DB regardless
  }

  await prisma.hotspotVoucher.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
