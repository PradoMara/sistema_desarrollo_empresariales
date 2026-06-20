import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        clients: true,
      },
    });
    
    // Si no hay pacientes, podríamos ejecutar el seed aquí (opcional) pero es mejor usar el Prisma Seed o hacerlo manualmente
    
    return NextResponse.json(patients);
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
