export default function PatientsPage() {
  const patients = require("@/features/reception/data/mock-patients").mockPatients;

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Pacientes</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Listado de pacientes</h2>

        <div className="mt-4 grid gap-4">
          {patients.map((p: any) => (
            <article key={p.id} className="rounded-lg border px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-sm text-slate-500">{p.especie} · {p.raza}</p>
                </div>
                <div className="text-sm text-slate-500">Microchip: <span className="font-medium text-slate-800">{p.microchip}</span></div>
              </div>

              <div className="mt-3 grid gap-2">
                <p className="text-sm font-semibold">Tutors</p>
                {p.clientesAsociados.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-xs text-slate-500">RUT: {c.rut} · {c.rol}</p>
                    </div>
                    <div>
                      {c.tieneDeuda ? (
                        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700">Deuda</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">Al día</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}