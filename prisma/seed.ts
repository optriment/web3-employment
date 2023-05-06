import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Seeding companies...')

  const company1 = await prisma.company.create({
    data: {
      display_name: 'Springfield Nuclear Power Plant (Staff)',
      comment: 'Staff',
    },
  })

  const company2 = await prisma.company.create({
    data: {
      display_name: 'Springfield Nuclear Power Plant (Workers)',
      comment: 'Sector 7G',
    },
  })

  console.log('Seeding employees...')

  await prisma.employee.create({
    data: {
      company_id: company1.id,
      display_name: 'Montgomery Burns',
      comment: 'Owner and CEO of the power plant',
    },
  })

  await prisma.employee.create({
    data: {
      company_id: company1.id,
      display_name: 'Waylon Smithers',
      comment: "Burns' loyal assistant",
    },
  })

  await prisma.employee.create({
    data: {
      company_id: company2.id,
      display_name: 'Homer Jay Simpson',
      wallet_address: '0xBEER',
      contacts: 'Homer_Simpson@AOL.com',
      comment: 'Technical supervisor',
    },
  })

  await prisma.employee.create({
    data: {
      company_id: company2.id,
      display_name: 'Lenny Leonard',
      comment: 'Worker in Sector 7G',
    },
  })

  await prisma.employee.create({
    data: {
      company_id: company2.id,
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
