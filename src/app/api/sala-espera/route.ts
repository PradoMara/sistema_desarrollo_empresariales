import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sala-espera
 *
 * Regla D3: Las EMERGENCIAS siempre aparecen primero, rompiendo el FIFO.
 * Prisma ordena primero por prioridadTriaje (EMERGENCIA < CONTROL alfabéticamente
 * no funciona — usamos ordenamiento en dos pasos: primero campo derivado, luego fecha).
 *
 * SQLite no soporta ORDER BY CASE directamente en Prisma, así que traemos ambas
 * categorías por separado y las concatenamos: EMERGENCIA + CONTROL, cada grupo
 * ordenado por fecha asc (orden de llegada dentro del grupo).
 */
export async function GET() {
  try {
    const [emergencias, controles] = await Promise.all([
      prisma.reserva.findMany({
        where: { estado: 'SALA_ESPERA', prioridadTriaje: 'EMERGENCIA' },
        include: { paciente: true, cliente: true },
        orderBy: { fecha: 'asc' },
      }),
      prisma.reserva.findMany({
        where: { estado: 'SALA_ESPERA', prioridadTriaje: 'CONTROL' },
        include: { paciente: true, cliente: true },
        orderBy: { fecha: 'asc' },
      }),
    ]);

    return NextResponse.json([...emergencias, ...controles]);
  } catch (error) {
    console.error('Error fetching sala de espera:', error);
    return NextResponse.json({ error: 'Error al obtener la sala de espera.' }, { status: 500 });
  }
}
