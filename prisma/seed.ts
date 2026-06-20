import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean the database
  await prisma.reserva.deleteMany()
  await prisma.transaccionPago.deleteMany()
  await prisma.client.deleteMany()
  await prisma.patient.deleteMany()

  // Seed data
  const p1 = await prisma.patient.create({
    data: {
      nombre: 'Luna',
      especie: 'Felino',
      raza: 'Siamés',
      microchip: '982 000 123 456 789',
      prioridad: 'Baja',
      clients: {
        create: {
          nombre: 'Ana Silva',
          rut: '15.234.567-8',
          rol: 'GARANTE_PRINCIPAL',
          estadoCrediticio: 'LIMPIO',
          autorizado: true,
        }
      }
    }
  })

  const p2 = await prisma.patient.create({
    data: {
      nombre: 'Max',
      especie: 'Canino',
      raza: 'Labrador Retriever',
      microchip: '982 000 987 654 321',
      prioridad: 'Media',
      clients: {
        create: {
          nombre: 'Carlos Mendoza',
          rut: '12.345.678-9',
          rol: 'GARANTE_PRINCIPAL',
          estadoCrediticio: 'DEUDA_TEMPRANA',
          autorizado: false,
        }
      }
    }
  })

  const p3 = await prisma.patient.create({
    data: {
      nombre: 'Coco',
      especie: 'Aves',
      raza: 'Loro',
      microchip: 'Sin microchip',
      prioridad: 'Alta',
      clients: {
        create: {
          nombre: 'Pedro Pascal',
          rut: '11.111.111-1',
          rol: 'GARANTE_PRINCIPAL',
          estadoCrediticio: 'LIMPIO',
          autorizado: true,
        }
      }
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
