import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET() {
  const settings = await prisma.appSetting.findMany()
  // Convert array to key-value object
  const result: Record<string, string> = {}
  for (const s of settings) {
    result[s.key] = s.value
  }
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const body = await req.json()

  if (typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be a key-value object' }, { status: 400 })
  }

  // Batch upsert all settings
  const operations = Object.entries(body).map(([key, value]) =>
    prisma.appSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    })
  )

  await prisma.$transaction(operations)

  await prisma.systemLog.create({
    data: { action: 'UPDATE_SETTINGS', details: `Updated ${Object.keys(body).length} settings` }
  })

  return NextResponse.json({ success: true })
}
