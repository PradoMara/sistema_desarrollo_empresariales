import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [enAtencion, emergencias, controles] = await Promise.all([
      prisma.reserva.findMany({
        where: { estado: 'EN_ATENCION' },
        include: { paciente: true, cliente: true },
        orderBy: { fecha: 'asc' },
      }),
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

    return NextResponse.json([...enAtencion, ...emergencias, ...controles]);
  } catch (error) {
    console.error('Error fetching sala de espera:', error);
    return NextResponse.json({ error: 'Error al obtener la sala de espera.' }, { status: 500 });
  }
}
