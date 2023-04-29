import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Seeding companies...')

  const company = await prisma.company.create({
    data: {
      display_name: 'Springfield Nuclear Power Plant',
      comment: 'Sector 7G',
    },
  })

  console.log('Seeding employees...')

  await prisma.employee.create({
    data: {
      company_id: company.id,
      display_name: 'Homer Jay Simpson',
      wallet_address: '0xDEADBEEF',
      contacts: 'Homer_Simpson@AOL.com',
      comment: 'Technical supervisor',
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
