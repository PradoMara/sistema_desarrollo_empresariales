"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  FileStack,
  LayoutDashboard,
  PawPrint,
  Settings,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Recepción", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: PawPrint },
  { href: "/clientes", label: "Clientes", icon: Shield },
  { href: "/agenda", label: "Agenda", icon: ChartNoAxesCombined },
  { href: "/urgencias", label: "Urgencias", icon: FileStack },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white/90 px-4 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] lg:flex lg:flex-col">
      <div className="mb-6 rounded-3xl bg-slate-950 px-5 py-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-200">VetClinic</p>
        <h2 className="mt-2 text-xl font-semibold">PMN Clínico</h2>
        <p className="mt-2 text-sm text-slate-300">Clínica veterinaria</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-sky-50 text-sky-800 ring-1 ring-sky-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border",
                  active ? "border-sky-200 bg-white" : "border-slate-200 bg-slate-50",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-sky-700" : "text-slate-500")} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}