import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluarMultiplesAbandonos } from '@/lib/abandonoService';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        clients: true,
        reservas: true,
      },
    });
    
    // Evaluar de forma perezosa la regla de abandono (72h) RN5
    await evaluarMultiplesAbandonos(prisma, patients);

    // Refetch para tener los datos actualizados tras la posible evaluación
    const updatedPatients = await prisma.patient.findMany({
      include: {
        clients: true,
        reservas: {
          where: {
            estado: {
              not: 'PAGADO_CERRADO',
            },
          },
        },
      },
    });
    
    return NextResponse.json(updatedPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, especie, raza, microchip, clienteNombre, clienteRut } = body;

    // Crear paciente conectándolo a un cliente existente o creándolo si no existe
    const patient = await prisma.patient.create({
      data: {
        nombre,
        especie,
        raza,
        microchip,
        prioridad: 'Baja',
        clients: {
          connectOrCreate: {
            where: { rut: clienteRut },
            create: {
              nombre: clienteNombre,
              rut: clienteRut,
              rol: 'GARANTE_PRINCIPAL',
              estadoCrediticio: 'LIMPIO',
              autorizado: true,
            }
          }
        }
      },
      include: {
        clients: true
      }
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
