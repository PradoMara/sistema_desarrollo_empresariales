import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluarMultiplesAbandonos } from '@/lib/abandonoService';

// GET /api/clientes — lista todos los clientes con sus pacientes asociados
export async function GET() {
  try {
    const clientesInitial = await prisma.client.findMany({
      include: { patients: { include: { reservas: true } } },
    });
    
    const allPatients = clientesInitial.flatMap(c => c.patients);
    if (allPatients.length > 0) {
      await evaluarMultiplesAbandonos(prisma, allPatients);
    }

    const clientes = await prisma.client.findMany({
      include: { patients: true },
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error fetching clientes:', error);
    return NextResponse.json({ error: 'Error al obtener clientes.' }, { status: 500 });
  }
}
