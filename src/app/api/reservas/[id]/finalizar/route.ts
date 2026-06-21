import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/reservas/[id]/finalizar — mueve la reserva a ATENCION_FINALIZADA y setea marcaTiempoAltaMedica
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

    if (reserva.estado !== 'EN_ATENCION') {
      return NextResponse.json(
        { error: `No se puede finalizar atención desde el estado "${reserva.estado}".` },
        { status: 409 },
      );
    }

    const actualizada = await prisma.reserva.update({
      where: { id },
      data: { 
        estado: 'ATENCION_FINALIZADA',
        marcaTiempoAltaMedica: new Date()
      },
      include: { paciente: true, cliente: true },
    });

    return NextResponse.json(actualizada);
  } catch (error) {
    console.error('Error al finalizar atención:', error);
    return NextResponse.json({ error: 'Error al finalizar atención.' }, { status: 500 });
  }
}
