import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/libs/prisma'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ message: ['Email and password are required'] }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.password) {
    return NextResponse.json({ message: ['Email or Password is invalid'] }, { status: 401, statusText: 'Unauthorized Access' })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json({ message: ['Email or Password is invalid'] }, { status: 401, statusText: 'Unauthorized Access' })
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role
  })
}
