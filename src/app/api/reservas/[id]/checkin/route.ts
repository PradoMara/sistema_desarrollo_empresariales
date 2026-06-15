import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/reservas/[id]/checkin — mueve la reserva a SALA_ESPERA
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada.' }, { status: 404 });
    }

    const estadosPermitidos = ['SOLICITUD_PENDIENTE', 'RESERVADO'];
    if (!estadosPermitidos.includes(reserva.estado)) {
      return NextResponse.json(
        { error: `No se puede hacer check-in desde el estado "${reserva.estado}".` },
        { status: 409 },
      );
    }

    const actualizada = await prisma.reserva.update({
      where: { id },
      data: { estado: 'SALA_ESPERA' },
      include: { paciente: true, cliente: true },
    });

    return NextResponse.json(actualizada);
  } catch (error) {
    console.error('Error en check-in:', error);
    return NextResponse.json({ error: 'Error al realizar check-in.' }, { status: 500 });
  }
}
