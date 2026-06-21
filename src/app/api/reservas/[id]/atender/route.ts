import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/reservas/[id]/atender — mueve la reserva a EN_ATENCION
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

    const estadosPermitidos = ['SALA_ESPERA', 'CLASIFICADO_TRIAJE', 'RESERVA_CONDICIONADA', 'RESERVA_DELEGACION'];
    if (!estadosPermitidos.includes(reserva.estado)) {
      return NextResponse.json(
        { error: `No se puede atender desde el estado "${reserva.estado}".` },
        { status: 409 },
      );
    }

    const actualizada = await prisma.reserva.update({
      where: { id },
      data: { estado: 'EN_ATENCION' },
      include: { paciente: true, cliente: true },
    });

    return NextResponse.json(actualizada);
  } catch (error) {
    console.error('Error al atender reserva:', error);
    return NextResponse.json({ error: 'Error al iniciar atención.' }, { status: 500 });
  }
}
