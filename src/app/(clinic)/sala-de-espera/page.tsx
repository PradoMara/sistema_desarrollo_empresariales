"use client";

import { useEffect, useState } from "react";
import { ActionBadge } from '@/features/reception/components/reception-dashboard';

export default function WaitingRoomPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWaitingList = async () => {
    try {
      const res = await fetch('/api/waiting-list');
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch (error) {
      console.error("Error fetching waiting list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitingList();
    
    // Polling simple para mantener la lista actualizada cada 5 segundos
    const interval = setInterval(fetchWaitingList, 5000);
    return () => clearInterval(interval);
  }, []);

  // Ordenar en frontend por si acaso (la API ya lo hace, pero para mantener la consistencia con prioridades)
  const sortedList = [...list].sort((a, b) => {
    const order: any = { Alta: 1, Media: 2, Baja: 3 };
    return (order[a.prioridad] || 4) - (order[b.prioridad] || 4) || a.timestamp.localeCompare(b.timestamp);
  });

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Sala de Espera</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pacientes en espera</h2>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-slate-500">Cargando sala de espera...</p>
          ) : sortedList.length === 0 ? (
            <p className="text-slate-500">No hay pacientes en la sala de espera.</p>
          ) : (
            sortedList.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold">{item.patientName} <span className="text-sm text-slate-500">· {item.clientName}</span></p>
                  <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ActionBadge className={`border-slate-200 bg-slate-50 ${item.prioridad === 'Alta' ? 'text-rose-700 font-bold border-rose-200 bg-rose-50' : 'text-slate-700'}`}>
                    {item.prioridad}
                  </ActionBadge>
                  <ActionBadge className="border-slate-200 bg-slate-50 text-slate-700">{item.tipo.replace('_', ' ')}</ActionBadge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
