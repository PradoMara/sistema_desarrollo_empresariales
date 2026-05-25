export default function SettingsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Ajustes</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Configuración mínima</h2>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="font-medium">Notificaciones</p>
              <p className="text-sm text-slate-500">Recibir notificaciones de ingreso y urgencias.</p>
            </div>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="font-medium">Modo demo</p>
              <p className="text-sm text-slate-500">Usar datos de prueba sin persistencia.</p>
            </div>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    </section>
  );
}