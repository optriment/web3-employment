import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Seeding groups...')

  const group1 = await prisma.group.create({
    data: {
      display_name: 'Springfield Nuclear Power Plant (Staff)',
      comment: 'Staff',
    },
  })

  const group2 = await prisma.group.create({
    data: {
      display_name: 'Springfield Nuclear Power Plant (Workers)',
      comment: 'Sector 7G',
    },
  })

  console.log('Seeding recipients...')

  await prisma.recipient.create({
    data: {
      group_id: group1.id,
      display_name: 'Montgomery Burns',
      comment: 'Owner and CEO of the power plant',
    },
  })

  await prisma.recipient.create({
    data: {
      group_id: group1.id,
      display_name: 'Waylon Smithers',
      comment: "Burns' loyal assistant",
    },
  })

  await prisma.recipient.create({
    data: {
      group_id: group2.id,
      display_name: 'Homer Jay Simpson',
      wallet_address: '0xBEER',
      contacts: 'Homer_Simpson@AOL.com',
      comment: 'Technical supervisor',
    },
  })

  await prisma.recipient.create({
    data: {
      group_id: group2.id,
      display_name: 'Lenny Leonard',
      comment: 'Worker in Sector 7G',
    },
  })

  await prisma.recipient.create({
    data: {
      group_id: group2.id,
      display_name: 'Carl Carlson',
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
