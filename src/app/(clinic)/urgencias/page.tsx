export default function UrgenciesPage() {
  const patients = require("@/features/reception/data/mock-patients").mockPatients;
  const urgencias = patients.filter((p: any) => p.clientesAsociados.some((c: any) => c.tieneDeuda));

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Urgencias</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Casos con prioridad por deuda</h2>

        <div className="mt-4 space-y-3">
          {urgencias.length === 0 ? (
            <p className="text-sm text-slate-500">No hay casos de urgencia basados en deuda.</p>
          ) : (
            urgencias.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-sm text-slate-500">Microchip: {p.microchip}</p>
                </div>
                <div className="text-sm">
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700">Revisar deuda</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}