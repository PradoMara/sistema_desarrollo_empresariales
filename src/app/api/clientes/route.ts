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

// POST /api/clientes — crea un nuevo cliente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, rut, telefono, email } = body;

    if (!nombre || !rut) {
      return NextResponse.json({ error: 'Nombre y RUT son requeridos.' }, { status: 400 });
    }

    const existe = await prisma.client.findUnique({ where: { rut } });
    if (existe) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese RUT.' }, { status: 400 });
    }

    const nuevoCliente = await prisma.client.create({
      data: {
        nombre,
        rut,
        telefono,
        email,
        rol: 'GARANTE_PRINCIPAL',
        estadoCrediticio: 'LIMPIO',
        autorizado: true,
      },
      include: { patients: true }
    });

    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error) {
    console.error('Error creating cliente:', error);
    return NextResponse.json({ error: 'Error al crear el cliente.' }, { status: 500 });
  }
}
