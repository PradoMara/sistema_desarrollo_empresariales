"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Cat, CheckCircle2, Dog, PawPrint, Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { mockPatients } from "../data/mock-patients";
import type { Patient, Toast } from "../types";

const toastStyles = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-950",
    icon: CheckCircle2,
    accent: "text-emerald-600",
  },
  warning: {
    container: "border-rose-200 bg-rose-50 text-rose-950",
    icon: AlertTriangle,
    accent: "text-rose-600",
  },
} as const;

function getPetIcon(species: string) {
  const normalizedSpecies = species.toLowerCase();

  if (normalizedSpecies.includes("gato")) return Cat;
  if (normalizedSpecies.includes("perro")) return Dog;
  return PawPrint;
}

function ActionBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Badge className={className}>{children}</Badge>;
}

export function ReceptionDashboard() {
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return patients;

    return patients.filter((patient) => {
      const matchesPatient =
        patient.nombre.toLowerCase().includes(normalizedSearch) ||
        patient.microchip.toLowerCase().includes(normalizedSearch);
      const matchesClient = patient.clientesAsociados.some((client) => client.rut.toLowerCase().includes(normalizedSearch));

      return matchesPatient || matchesClient;
    });
  }, [patients, searchTerm]);

  const activeClient = selectedPatient?.clientesAsociados.find((client) => client.id === selectedClientId) ?? null;
  const selectedClientHasDebt = activeClient?.tieneDeuda ?? false;

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((currentToasts) => [...currentToasts, { id, ...toast }]);

    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((item) => item.id !== id));
    }, 3500);
  };

  const openCheckIn = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedClientId(patient.clientesAsociados[0]?.id ?? "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setSelectedClientId("");
  };

  const handleConfirmCheckIn = () => {
    if (!selectedPatient || !activeClient) return;

    if (activeClient.tieneDeuda) {
      addToast({
        title: "Ingreso como urgencia registrado",
        description: `${activeClient.nombre} presenta deuda pendiente. Se autorizó ingreso por urgencia vital.`,
        tone: "warning",
      });
      closeModal();
      return;
    }

    addToast({
      title: "Paciente enviado a sala de espera",
      description: `${selectedPatient.nombre} fue ingresado por ${activeClient.nombre}.`,
      tone: "success",
    });
    closeModal();
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-12"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre de mascota, microchip o RUT del cliente..."
            />
          </div>

          <Button variant="secondary" className="gap-2 lg:w-auto">
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <ActionBadge className="border-sky-200 bg-sky-50 text-sky-800">{filteredPatients.length} pacientes visibles</ActionBadge>
          <p>Vista de recepción optimizada para check-in y triaje rápido.</p>
        </div>
      </section>

      <section className="pb-6">
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <p className="text-lg font-semibold text-slate-900">Sin coincidencias</p>
              <p className="mt-2 text-sm text-slate-500">Prueba con otro nombre de mascota, microchip o RUT del cliente.</p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const PetIcon = getPetIcon(patient.especie);

              return (
                <article
                  key={patient.id}
                  className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] lg:items-center lg:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-100 text-sky-700">
                      <PetIcon className="h-7 w-7" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">Paciente</p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{patient.nombre}</h2>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        <ActionBadge className="border-slate-200 bg-slate-50 text-slate-700">{patient.especie}</ActionBadge>
                        <ActionBadge className="border-slate-200 bg-slate-50 text-slate-700">{patient.raza}</ActionBadge>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        Microchip: <span className="font-medium text-slate-800">{patient.microchip}</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Vínculos de tutoría</p>
                    <ul className="mt-3 space-y-2">
                      {patient.clientesAsociados.map((client) => (
                        <li key={client.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{client.nombre}</p>
                            <p className="text-sm text-slate-500">RUT: {client.rut} · {client.rol}</p>
                          </div>

                          {client.tieneDeuda ? (
                            <span className="inline-flex w-fit items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">Deuda Pendiente</span>
                          ) : (
                            <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Al día</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-end lg:justify-end">
                    <Button onClick={() => openCheckIn(patient)} className="w-full sm:w-auto">
                      Iniciar Atención
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {isModalOpen && selectedPatient ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Check-in de recepción</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">¿Quién trae a {selectedPatient.nombre} hoy?</h2>
                <p className="mt-2 text-sm text-slate-500">Selecciona el tutor que acompaña al paciente para continuar el ingreso.</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="grid gap-3">
                {selectedPatient.clientesAsociados.map((client) => {
                  const isSelected = client.id === selectedClientId;

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => setSelectedClientId(client.id)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${isSelected ? "border-sky-300 bg-sky-50 ring-4 ring-sky-100" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{client.nombre}</span>
                          <ActionBadge className="border-slate-200 bg-slate-50 text-slate-700">{client.rol}</ActionBadge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">RUT: {client.rut}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium">
                        {client.tieneDeuda ? (
                          <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700">
                            <AlertTriangle className="mr-1.5 h-4 w-4" />
                            Deuda
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Sin deuda
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedClientHasDebt ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900">
                  <p className="flex items-start gap-3 text-sm font-medium">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <span>Atención: Cliente con deuda pendiente. Solo se autoriza ingreso por Urgencia Vital.</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
              <Button variant="ghost" onClick={closeModal}>
                Cancelar
              </Button>

              <Button variant={selectedClientHasDebt ? "danger" : "primary"} onClick={handleConfirmCheckIn}>
                {selectedClientHasDebt ? "Ingresar como Urgencia" : "Enviar a Sala de Espera"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] flex-col gap-3 sm:w-[380px]">
        {toasts.map((toast) => {
          const tone = toastStyles[toast.tone];
          const ToastIcon = tone.icon;

          return (
            <div key={toast.id} className={`rounded-2xl border px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${tone.container}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 ${tone.accent}`}>
                  <ToastIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{toast.title}</p>
                  <p className="mt-1 text-sm leading-5 opacity-90">{toast.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}