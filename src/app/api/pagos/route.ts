import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reservaId, montoPagado } = body as { reservaId: string; montoPagado: number };

    if (!reservaId) {
      return NextResponse.json({ error: 'reservaId es obligatorio' }, { status: 400 });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { transaccionPago: true }
    });

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // RN3 - Cierre Administrativo
    // La consulta clínica solo se considera cerrada cuando el estado administrativo cambia a Pagado.
    
    // Obtenemos o creamos la transacción base (asumiendo monto base 50000 si no existe)
    const montoFinal = reserva.transaccionPago?.montoTotal ?? 50000;

    if (montoPagado < montoFinal) {
      return NextResponse.json({ 
        error: `Monto insuficiente. El total a pagar es ${montoFinal}`,
        montoTotal: montoFinal
      }, { status: 400 });
    }

    // Ejecutamos la transacción de DB para cerrar la reserva y registrar el pago
    const result = await prisma.$transaction(async (tx) => {
      // 1. Marcar Transacción como PAGADO
      const pago = await tx.transaccionPago.upsert({
        where: { reservaId },
        update: { estadoPago: 'PAGADO' },
        create: {
          reservaId,
          montoBase: montoFinal,
          montoTotal: montoFinal,
          recargoCustodia: 0,
          estadoPago: 'PAGADO'
        }
      });

      // 2. Cerrar la reserva (RN3)
      const reservaActualizada = await tx.reserva.update({
        where: { id: reservaId },
        data: { estado: 'PAGADO_CERRADO' }
      });

      // 3. (Opcional) Limpiar estado de deuda temprana si el cliente tenía deudas y ahora pagó
      // En un caso real habría que verificar que no existan otras reservas pendientes, 
      // pero para el PMV asumimos que si paga se limpia si estaba en DEUDA_TEMPRANA
      const cliente = await tx.client.findUnique({ where: { id: reserva.clienteId }});
      if (cliente && cliente.estadoCrediticio === 'DEUDA_TEMPRANA') {
        await tx.client.update({
          where: { id: cliente.id },
          data: { estadoCrediticio: 'LIMPIO' }
        });
      }

      return { pago, reserva: reservaActualizada };
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error procesando pago:', error);
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 });
  }
}
