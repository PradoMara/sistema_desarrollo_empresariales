export default function SchedulePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Agenda</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Citas próximas</h2>

        <div className="mt-4 space-y-3">
          {/* Mock simple de citas */}
          {[
            { id: 'c1', when: '2026-05-24 09:00', patient: 'Boby', client: 'Carolina Pérez', status: 'Confirmada' },
            { id: 'c2', when: '2026-05-24 09:30', patient: 'Luna', client: 'Fernanda Soto', status: 'Pendiente' },
            { id: 'c3', when: '2026-05-24 10:00', patient: 'Mishi', client: 'Marcelo Díaz', status: 'Urgencia' },
          ].map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="font-semibold">{c.patient} <span className="text-sm text-slate-500">· {c.client}</span></p>
                <p className="text-sm text-slate-500">{c.when}</p>
              </div>
              <div className="text-sm">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${c.status === 'Urgencia' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}