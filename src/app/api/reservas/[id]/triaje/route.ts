import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type PrioridadTriaje = 'CONTROL' | 'EMERGENCIA';

// PATCH /api/reservas/[id]/triaje — actualiza la prioridad de triaje
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { prioridadTriaje } = body as { prioridadTriaje: PrioridadTriaje };

    if (!['CONTROL', 'EMERGENCIA'].includes(prioridadTriaje)) {
      return NextResponse.json(
        { error: 'prioridadTriaje debe ser "CONTROL" o "EMERGENCIA".' },
        { status: 400 },
      );
    }

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada.' }, { status: 404 });
    }
    if (reserva.estado !== 'SALA_ESPERA') {
      return NextResponse.json(
        { error: 'El triaje solo se puede cambiar en reservas en SALA_ESPERA.' },
        { status: 409 },
      );
    }

    const actualizada = await prisma.reserva.update({
      where: { id },
      data: { prioridadTriaje },
      include: { paciente: true, cliente: true },
    });

    return NextResponse.json(actualizada);
  } catch (error) {
    console.error('Error actualizando triaje:', error);
    return NextResponse.json({ error: 'Error al actualizar triaje.' }, { status: 500 });
  }
}
