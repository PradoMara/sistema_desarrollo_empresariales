import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reservas — lista todas las reservas
export async function GET() {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        paciente: true,
        cliente: true,
        transaccionPago: true,
      },
      orderBy: { fecha: 'asc' },
    });
    return NextResponse.json(reservas);
  } catch (error) {
    console.error('Error fetching reservas:', error);
    return NextResponse.json({ error: 'Error al obtener reservas' }, { status: 500 });
  }
}

// POST /api/reservas — crear reserva con validación RN7 y Excepción E2
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pacienteId, clienteId, fecha, notas, estado: estadoBody, prioridadTriaje: prioridadBody, tipo } = body as {
      pacienteId: string;
      clienteId: string;
      fecha: string;
      notas?: string;
      estado?: string;
      prioridadTriaje?: string;
      tipo?: string;
    };

    // Validación de campos obligatorios del body
    if (!pacienteId || !clienteId || !fecha) {
      return NextResponse.json(
        { error: 'pacienteId, clienteId y fecha son obligatorios.' },
        { status: 400 },
      );
    }

    const parsedDate = new Date(fecha);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Formato de fecha inválido.' }, { status: 400 });
    }

    const paciente = await prisma.patient.findUnique({ where: { id: pacienteId } });
    if (!paciente) return NextResponse.json({ error: 'Paciente no encontrado.' }, { status: 404 });

    if (!paciente.nombre?.trim() || !paciente.especie?.trim()) {
      return NextResponse.json(
        { error: 'RN7: El paciente no tiene Nombre o Especie registrados. Complete la ficha primero.' },
        { status: 422 },
      );
    }

    const cliente = await prisma.client.findUnique({ where: { id: clienteId } });
    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });

    if (!cliente.telefono?.trim() && !cliente.email?.trim()) {
      return NextResponse.json(
        { error: 'RN7: El cliente no tiene teléfono ni email registrados. Actualice sus datos de contacto.' },
        { status: 422 },
      );
    }

    // Lógica para Excepción E2 (Cliente no autorizado)
    let estadoFinal = estadoBody ?? 'SOLICITUD_PENDIENTE';
    let prioridadFinal = prioridadBody ?? 'CONTROL';

    if (cliente.autorizado === false) {
      // Nivel 1: Urgencia
      if (tipo === 'urgencia' || prioridadBody === 'EMERGENCIA') {
        estadoFinal = 'SALA_ESPERA';
        prioridadFinal = 'EMERGENCIA';
      } 
      // Nivel 2: Delegación Provisoria
      else if (estadoBody === 'delegacion_provisoria') {
        estadoFinal = 'RESERVA_DELEGACION';
      } 
      // Nivel 3: Traspaso de Titularidad
      else if (estadoBody === 'traspaso_solicitado') {
        estadoFinal = 'RESERVA_CONDICIONADA';
      } else {
        // Rechazo inmediato por defecto si no es ninguna de las ramas de E2
        return NextResponse.json(
          { error: 'E2: Cliente no autorizado para acceder a esta ficha sin un protocolo.' },
          { status: 403 }
        );
      }
    } else {
      // Cliente autorizado, mapeos estándar del front-end al back-end
      if (estadoBody === 'en_espera') estadoFinal = 'SALA_ESPERA';
    }

    const reserva = await prisma.reserva.create({
      data: {
        pacienteId,
        clienteId,
        fecha: parsedDate,
        estado: estadoFinal,
        prioridadTriaje: prioridadFinal,
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
