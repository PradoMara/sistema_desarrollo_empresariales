import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/pacientes/[id]/activar
 *
 * Simula la firma física de la Declaración de Propiedad (Regla RN7).
 * Transiciona el estadoFicha de "PENDIENTE_VALIDACION" → "ACTIVA".
 */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const paciente = await prisma.patient.findUnique({ where: { id } });
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado.' }, { status: 404 });
    }
    if (paciente.estadoFicha === 'ACTIVA') {
      return NextResponse.json({ error: 'La ficha ya está activa.' }, { status: 409 });
    }

    const actualizado = await prisma.patient.update({
      where: { id },
      data: { estadoFicha: 'ACTIVA' },
      include: { clients: true },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error('Error activando ficha:', error);
    return NextResponse.json({ error: 'Error al activar la ficha.' }, { status: 500 });
  }
}
