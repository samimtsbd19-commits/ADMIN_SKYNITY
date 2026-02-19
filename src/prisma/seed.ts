import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skynity.org' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@skynity.org',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('✅ Admin user ready:', admin.email)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
