import { mockWaiting } from '@/features/reception/data/mock-waiting';
import { ActionBadge } from '@/features/reception/components/reception-dashboard';

export default function WaitingRoomPage() {
  const list = [...mockWaiting].sort((a, b) => {
    const order: any = { Alta: 1, Media: 2, Baja: 3 };
    return order[a.prioridad] - order[b.prioridad] || a.timestamp.localeCompare(b.timestamp);
  });

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Sala de Espera</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pacientes en espera</h2>

        <div className="mt-4 space-y-3">
          {list.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="font-semibold">{item.patientName} <span className="text-sm text-slate-500">· {item.clientName}</span></p>
                <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">{item.prioridad}</span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">{item.tipo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
