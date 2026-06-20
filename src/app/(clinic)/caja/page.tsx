'use client';

import { useCallback, useEffect, useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface TransaccionPago {
  montoBase: number;
  montoTotal: number;
  recargoCustodia: number;
  estadoPago: string;
}

interface Reserva {
  id: string;
  fecha: string;
  estado: string;
  paciente: { nombre: string; especie: string };
  cliente: { nombre: string; rut: string; estadoCrediticio: string };
  transaccionPago?: TransaccionPago | null;
}

export default function CajaPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCaja = useCallback(async () => {
    try {
      const res = await fetch('/api/reservas');
      if (res.ok) {
        const data: Reserva[] = await res.json();
        // Filtrar solo las que están listas para pagar
        const porPagar = data.filter((r) => r.estado === 'ATENCION_FINALIZADA');
        setReservas(porPagar);
      } else {
        setError('Error al cargar caja.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCaja(); }, [fetchCaja]);

  const handlePagar = async (reserva: Reserva) => {
    setProcessingId(reserva.id);
    const montoPagar = reserva.transaccionPago?.montoTotal ?? 50000;

    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservaId: reserva.id, montoPagado: montoPagar }),
      });

      if (res.ok) {
        // Remover de la lista una vez pagado exitosamente
        setReservas((prev) => prev.filter((r) => r.id !== reserva.id));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Error procesando pago');
      }
    } catch {
      alert('Error de red procesando pago');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-8 h-8 text-sky-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caja y Facturación</h1>
          <p className="text-sm text-slate-500">Proceso de Cierre Administrativo (Pagos)</p>
        </div>
      </div>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : loading ? (
        <p className="text-slate-500">Cargando cuentas por cobrar...</p>
      ) : reservas.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900">Todo al día</h2>
          <p className="text-slate-500">No hay atenciones finalizadas pendientes de pago.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservas.map((r) => {
            const transaccion = r.transaccionPago;
            const tieneRecargo = (transaccion?.recargoCustodia ?? 0) > 0;
            const montoPagar = transaccion?.montoTotal ?? 50000;

            return (
              <article key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="space-y-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{r.paciente.nombre}</p>
                    <span className="text-xs text-slate-500">({r.paciente.especie})</span>
                    {r.cliente.estadoCrediticio === 'LITIGIO_ABANDONO' && (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                        Bloqueo por Abandono
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">Tutor: {r.cliente.nombre} — {r.cliente.rut}</p>
                  <p className="text-xs text-slate-400">Fecha de reserva: {new Date(r.fecha).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total a Pagar</p>
                    <p className="text-xl font-bold text-slate-900">
                      ${montoPagar.toLocaleString('es-CL')}
                    </p>
                    {tieneRecargo && (
                      <p className="text-xs text-rose-500 font-medium">
                        Incluye ${transaccion?.recargoCustodia.toLocaleString('es-CL')} por recargo de hotelería
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handlePagar(r)}
                    disabled={processingId === r.id}
                    className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {processingId === r.id ? 'Procesando...' : 'Procesar Pago'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
