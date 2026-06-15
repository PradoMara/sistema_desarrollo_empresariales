import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reservas — lista todas las reservas
export async function GET() {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        paciente: true,
        cliente: true,
      },
      orderBy: { fecha: 'asc' },
    });
    return NextResponse.json(reservas);
  } catch (error) {
    console.error('Error fetching reservas:', error);
    return NextResponse.json({ error: 'Error al obtener reservas' }, { status: 500 });
  }
}

// POST /api/reservas — crear reserva con validación RN7
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pacienteId, clienteId, fecha, notas } = body as {
      pacienteId: string;
      clienteId: string;
      fecha: string;
      notas?: string;
      estado?: string;
      prioridadTriaje?: string;
    };

    // Validación de campos obligatorios del body
    if (!pacienteId || !clienteId || !fecha) {
      return NextResponse.json(
        { error: 'pacienteId, clienteId y fecha son obligatorios.' },
        { status: 400 },
      );
    }

    // Validación de fecha
    const parsedDate = new Date(fecha);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido.' },
        { status: 400 },
      );
    }

    // RN7 – validar que el Paciente tenga nombre y especie
    const paciente = await prisma.patient.findUnique({ where: { id: pacienteId } });
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado.' }, { status: 404 });
    }
    if (!paciente.nombre?.trim() || !paciente.especie?.trim()) {
      return NextResponse.json(
        { error: 'RN7: El paciente no tiene Nombre o Especie registrados. Complete la ficha primero.' },
        { status: 422 },
      );
    }

    // RN7 – validar que el Cliente tenga contacto (teléfono o email)
    const cliente = await prisma.client.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });
    }
    if (!cliente.telefono?.trim() && !cliente.email?.trim()) {
      return NextResponse.json(
        { error: 'RN7: El cliente no tiene teléfono ni email registrados. Actualice sus datos de contacto.' },
        { status: 422 },
      );
    }

    const reserva = await prisma.reserva.create({
      data: {
        pacienteId,
        clienteId,
        fecha: parsedDate,
        estado: estado ?? 'SOLICITUD_PENDIENTE',
        prioridadTriaje: prioridadTriaje ?? 'CONTROL',
        notas: notas ?? null,
      },
      include: { paciente: true, cliente: true },
    });

    return NextResponse.json(reserva, { status: 201 });
  } catch (error) {
    console.error('Error creating reserva:', error);
    return NextResponse.json({ error: 'Error al crear la reserva.' }, { status: 500 });
  }
}
