import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const waitingList = await prisma.waitingRoom.findMany({
      include: {
        patient: true,
        client: true,
      },
      orderBy: {
        timestamp: 'asc',
      }
    });

    // Mapear para devolver un formato amigable para el frontend
    const formattedList = waitingList.map(item => ({
      id: item.id,
      patientId: item.patientId,
      patientName: item.patient.nombre,
      clientId: item.clientId,
      clientName: item.client.nombre,
      tipo: item.tipo,
      prioridad: item.prioridad,
      timestamp: item.timestamp.toISOString(),
      estado: item.estado,
    }));

    return NextResponse.json(formattedList);
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    return NextResponse.json({ error: 'Failed to fetch waiting list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, clientId, tipo, prioridad, estado } = body;

    const waitingRecord = await prisma.waitingRoom.create({
      data: {
        patientId,
        clientId,
        tipo,
        prioridad,
        estado,
      },
      include: {
        patient: true,
        client: true,
      }
    });

    const formattedRecord = {
      id: waitingRecord.id,
      patientId: waitingRecord.patientId,
      patientName: waitingRecord.patient.nombre,
      clientId: waitingRecord.clientId,
      clientName: waitingRecord.client.nombre,
      tipo: waitingRecord.tipo,
      prioridad: waitingRecord.prioridad,
      timestamp: waitingRecord.timestamp.toISOString(),
      estado: waitingRecord.estado,
    };

    return NextResponse.json(formattedRecord, { status: 201 });
  } catch (error) {
    console.error('Error adding to waiting list:', error);
    return NextResponse.json({ error: 'Failed to add to waiting list' }, { status: 500 });
  }
}
