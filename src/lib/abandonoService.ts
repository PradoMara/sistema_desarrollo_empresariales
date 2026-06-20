import { PrismaClient, Patient, Reserva, Client } from '@prisma/client';

// Calcular la penalización por día de abandono (ej. costo de hotelería)
const RECARGO_DIARIO_HOTELERIA = 15000;

export async function evaluarAbandono(prisma: PrismaClient, patientId: string) {
  // Buscamos si el paciente tiene alguna reserva que haya pasado de 72 horas desde el alta sin ser pagada
  const reservaAbandonada = await prisma.reserva.findFirst({
    where: {
      pacienteId: patientId,
      estado: 'ATENCION_FINALIZADA',
      marcaTiempoAltaMedica: {
        lte: new Date(Date.now() - 72 * 60 * 60 * 1000) // 72 horas atrás
      }
    },
    include: {
      cliente: true,
      transaccionPago: true
    }
  });

  if (!reservaAbandonada) return;

  // Si existe una reserva en este estado que excedió las 72h, aplicamos RN5 (Protocolo de Abandono)
  
  // 1. Calcular días extras transcurridos desde las 72h
  const altaMedica = reservaAbandonada.marcaTiempoAltaMedica!;
  const horasTranscurridas = (Date.now() - altaMedica.getTime()) / (1000 * 60 * 60);
  const diasAbandono = Math.floor((horasTranscurridas - 72) / 24) + 1; // Mínimo 1 día de recargo
  
  const recargoTotal = diasAbandono > 0 ? diasAbandono * RECARGO_DIARIO_HOTELERIA : 0;

  // Ejecutamos una transacción de base de datos para asegurar consistencia
  await prisma.$transaction(async (tx) => {
    // 1. Bloquear al Cliente (Litigio por Abandono)
    await tx.client.update({
      where: { id: reservaAbandonada.clienteId },
      data: { estadoCrediticio: 'LITIGIO_ABANDONO' }
    });

    // 2. Extinguir la propiedad del Paciente y bloquear su ficha
    await tx.patient.update({
      where: { id: patientId },
      data: { estadoFicha: 'BLOQUEADA' }
    });

    // 3. Crear o actualizar la transacción de pago con el recargo dinámico
    const montoBaseActual = reservaAbandonada.transaccionPago?.montoBase ?? 50000; // Monto por defecto si no existía

    await tx.transaccionPago.upsert({
      where: { reservaId: reservaAbandonada.id },
      update: {
        recargoCustodia: recargoTotal,
        montoTotal: montoBaseActual + recargoTotal
      },
      create: {
        reservaId: reservaAbandonada.id,
        montoBase: montoBaseActual,
        recargoCustodia: recargoTotal,
        montoTotal: montoBaseActual + recargoTotal,
        estadoPago: 'PENDIENTE'
      }
    });

    // Opcionalmente, cambiar estado de la reserva si así lo decide el negocio
    // Por ahora lo dejamos en ATENCION_FINALIZADA para que mantenga la deuda
  });
}

/**
 * Evalúa todos los pacientes en una lista de forma "perezosa".
 * Debería llamarse antes de retornar listas en los endpoints GET.
 */
export async function evaluarMultiplesAbandonos(prisma: PrismaClient, pacientes: (Patient & { reservas?: Reserva[] })[]) {
  // Optimizamos iterando y filtrando los que en memoria ya sabemos que pueden tener abandono
  const promesas = pacientes.map(async (p) => {
    // Si tenemos las reservas en memoria, hacemos un chequeo rápido
    if (p.reservas) {
      const tienePotencialAbandono = p.reservas.some(r => 
        r.estado === 'ATENCION_FINALIZADA' && 
        r.marcaTiempoAltaMedica && 
        (Date.now() - new Date(r.marcaTiempoAltaMedica).getTime() > 72 * 60 * 60 * 1000)
      );
      if (!tienePotencialAbandono) return;
    }
    
    // Si la condición rápida se cumple (o no teníamos las reservas incluidas), hacemos la consulta fuerte
    await evaluarAbandono(prisma, p.id);
  });

  await Promise.allSettled(promesas);
}
