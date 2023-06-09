import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { prisma } from '../src/lib/prisma'

const adapter = PrismaAdapter(prisma)

async function main() {
  console.log('Seeding users...')

  const timestamp = +new Date()

  const user = await adapter.createUser({
    name: `User ${timestamp}`,
    email: `me.${timestamp}@domain.tld`,
    emailVerified: new Date(),
  })

  console.log('Seeding groups...')

  const group1 = await prisma.group.create({
    data: {
      userId: user.id,
      displayName: 'Springfield Nuclear Power Plant (Staff)',
      comment: 'Staff',
    },
  })

  const group2 = await prisma.group.create({
    data: {
      userId: user.id,
      displayName: 'Springfield Nuclear Power Plant (Workers)',
      comment: 'Sector 7G',
    },
  })

  console.log('Seeding recipients...')

  await prisma.recipient.create({
    data: {
      groupId: group1.id,
      displayName: 'Montgomery Burns',
      comment: 'Owner and CEO of the power plant',
    },
  })

  await prisma.recipient.create({
    data: {
      groupId: group1.id,
      displayName: 'Waylon Smithers',
      comment: "Burns' loyal assistant",
    },
  })

  await prisma.recipient.create({
    data: {
      groupId: group2.id,
      displayName: 'Homer Jay Simpson',
      walletAddress: '0xBEER',
      contacts: 'Homer_Simpson@AOL.com',
      comment: 'Technical supervisor',
    },
  })

  await prisma.recipient.create({
    data: {
      groupId: group2.id,
      displayName: 'Lenny Leonard',
      comment: 'Worker in Sector 7G',
    },
  })

  await prisma.recipient.create({
    data: {
      groupId: group2.id,
      displayName: 'Carl Carlson',
      comment: 'Worker in Sector 7G',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
