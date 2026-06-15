import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clientes — lista todos los clientes con sus pacientes asociados
export async function GET() {
  try {
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
