export default function ClientsPage() {
  // Extraer clientes únicos desde mocks
  const patients = require("@/features/reception/data/mock-patients").mockPatients;
  const map = new Map();
  patients.forEach((p: any) => {
    p.clientesAsociados.forEach((c: any) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });
  });

  const clients = Array.from(map.values());

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Clientes</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Directorio de tutores</h2>

        <div className="mt-4 grid gap-3">
          {clients.map((client: any) => (
            <div key={client.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="font-semibold">{client.nombre}</p>
                <p className="text-sm text-slate-500">RUT: {client.rut} · {client.rol}</p>
              </div>
              <div>
                {client.tieneDeuda ? (
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700">Deuda</span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">Al día</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}