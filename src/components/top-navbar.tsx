import { Badge } from "@/components/ui/badge";

export function TopNavbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">VetClinic</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Recepción</h1>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <span className="inline-flex h-9 items-center rounded-full bg-sky-100 px-3 font-semibold text-sky-700">
          Recepcionista: Turno Mañana
        </span>
        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Activo</Badge>
      </div>
    </header>
  );
}