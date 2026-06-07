"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Cat, CheckCircle2, Dog, PawPrint, Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Toast } from "../types";

// Tipos adaptados de Prisma
export type Client = {
  id: string;
  nombre: string;
  rut: string;
  rol: string;
  tieneDeuda: boolean;
  autorizado: boolean;
};

export type Patient = {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  microchip: string;
  prioridad: string | null;
  clients: Client[];
};

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

  if (normalizedSpecies.includes("gato") || normalizedSpecies.includes("felino")) return Cat;
  if (normalizedSpecies.includes("perro") || normalizedSpecies.includes("canino")) return Dog;
  return PawPrint;
}

export function ActionBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Badge className={className}>{children}</Badge>;
}

export function ReceptionDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal de Nuevo Paciente
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    nombre: "", especie: "", raza: "", microchip: "", clienteNombre: "", clienteRut: ""
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPatients = await fetch('/api/patients');
        if (resPatients.ok) {
          const data = await resPatients.json();
          setPatients(data);
        }
        
        const resWaiting = await fetch('/api/waiting-list');
        if (resWaiting.ok) {
          const data = await resWaiting.json();
          setWaitingList(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPatients = useMemo(() => {
    if (!normalizedSearch) return patients;

    return patients.filter((patient) => {
      const matchesPatient =
        patient.nombre.toLowerCase().includes(normalizedSearch) ||
        patient.microchip.toLowerCase().includes(normalizedSearch);
      const matchesClient = patient.clients.some((client) => client.rut.toLowerCase().includes(normalizedSearch));

      return matchesPatient || matchesClient;
    });
  }, [patients, normalizedSearch]);

  const potentialDuplicates = useMemo(() => {
    if (normalizedSearch.length < 3) return [] as Patient[];

    return patients.filter((patient) => {
      return (
        patient.nombre.toLowerCase().includes(normalizedSearch) ||
        patient.microchip.replace(/\s+/g, "").includes(normalizedSearch.replace(/\s+/g, ""))
      );
    });
  }, [patients, normalizedSearch]);

  const isExactMatch = patients.some(
    (p) => p.nombre.toLowerCase() === normalizedSearch || p.microchip.toLowerCase() === normalizedSearch,
  );

  const activeClient = selectedPatient?.clients.find((client) => client.id === selectedClientId) ?? null;
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
    setSelectedClientId(patient.clients[0]?.id ?? "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setSelectedClientId("");
  };

  const addToWaitingListAPI = async (data: any) => {
    try {
      const res = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newRecord = await res.json();
        setWaitingList((cur) => [...cur, newRecord]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding to waiting list", error);
      return false;
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!selectedPatient || !activeClient) return;
    const tipo = activeClient.tieneDeuda ? "urgencia" : "normal";
    const prioridad = selectedPatient.prioridad ?? (activeClient.tieneDeuda ? "Media" : "Baja");

    const success = await addToWaitingListAPI({
      patientId: selectedPatient.id,
      clientId: activeClient.id,
      tipo,
      prioridad,
      estado: "en_espera"
    });

    if (success) {
      addToast({
        title: tipo === "urgencia" ? "Ingreso como urgencia registrado" : "Paciente enviado a sala de espera",
        description:
          tipo === "urgencia"
            ? `${activeClient.nombre} presenta deuda pendiente. Se autorizó ingreso por urgencia vital.`
            : `${selectedPatient.nombre} fue ingresado por ${activeClient.nombre}.`,
        tone: tipo === "urgencia" ? "warning" : "success",
      });
      closeModal();
    }
  };

  const handleIngresarEmergencia = async () => {
    if (!selectedPatient || !activeClient) return;

    const success = await addToWaitingListAPI({
      patientId: selectedPatient.id,
      clientId: activeClient.id,
      tipo: "urgencia",
      prioridad: "Alta",
      estado: "en_espera"
    });

    if (success) {
      addToast({
        title: "Ingreso como emergencia",
        description: `${selectedPatient.nombre} ingresado como emergencia por ${activeClient.nombre}.`,
        tone: "warning",
      });
      closeModal();
    }
  };

  const handleDelegacionProvisoria = async () => {
    if (!selectedPatient || !activeClient) return;

    const success = await addToWaitingListAPI({
      patientId: selectedPatient.id,
      clientId: activeClient.id,
      tipo: "reserva_condicionada",
      prioridad: selectedPatient.prioridad ?? "Baja",
      estado: "delegacion_provisoria"
    });

    if (success) {
      addToast({
        title: "Reserva condicionada",
        description: `${selectedPatient.nombre} ingresado como reserva condicionada (Delegación Provisoria).`,
        tone: "success",
      });
      closeModal();
    }
  };

  const handleSolicitarTraspaso = async () => {
    if (!selectedPatient || !activeClient) return;

    const success = await addToWaitingListAPI({
      patientId: selectedPatient.id,
      clientId: activeClient.id,
      tipo: "traspaso_solicitado",
      prioridad: selectedPatient.prioridad ?? "Baja",
      estado: "traspaso_solicitado"
    });

    if (success) {
      addToast({
        title: "Traspaso solicitado",
        description: `Se ha registrado una solicitud de traspaso de titularidad para ${selectedPatient.nombre}.`,
        tone: "success",
      });
      closeModal();
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientForm),
      });
      
      if (res.ok) {
        const newPatient = await res.json();
        setPatients(cur => [...cur, newPatient]);
        addToast({
          title: "Paciente Registrado",
          description: `${newPatientForm.nombre} ha sido registrado correctamente en la base de datos.`,
          tone: "success",
        });
        setIsNewPatientModalOpen(false);
        setNewPatientForm({ nombre: "", especie: "", raza: "", microchip: "", clienteNombre: "", clienteRut: "" });
      }
    } catch (error) {
      console.error("Error creating patient:", error);
    }
  };

  useEffect(() => {
    if (!isModalOpen && !isNewPatientModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        setIsNewPatientModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isNewPatientModalOpen]);

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

          <Button variant="secondary" className="gap-2 lg:w-auto" onClick={() => setIsNewPatientModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <ActionBadge className="border-sky-200 bg-sky-50 text-sky-800">{filteredPatients.length} pacientes visibles</ActionBadge>
          <p>Vista de recepción conectada a la Base de Datos.</p>
        </div>
      </section>

      {/* Detección de duplicidad: banner informativo */}
      {normalizedSearch && potentialDuplicates.length > 0 && !isExactMatch ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <p className="font-semibold">¿Es este el paciente? Evite duplicar fichas.</p>
          <div className="mt-2 flex gap-3 text-sm text-amber-800">
            {potentialDuplicates.slice(0, 3).map((p) => (
              <div key={p.id} className="rounded-md border border-amber-100 bg-white px-3 py-2">
                <p className="font-medium">{p.nombre}</p>
                <p className="text-xs text-slate-500">Microchip: {p.microchip}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
              const isPotentialDuplicate = potentialDuplicates.some((p) => p.id === patient.id);
              const garante = patient.clients.find((c) => c.rol === "Garante Principal" || c.rol === "Tutor Principal");

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
                      {garante ? (
                        <p className="mt-1 text-sm text-slate-600">Representante: <span className="font-medium text-slate-800">{garante.nombre}</span></p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        <ActionBadge className="border-slate-200 bg-slate-50 text-slate-700">{patient.especie}</ActionBadge>
                        <ActionBadge className="border-slate-200 bg-slate-50 text-slate-700">{patient.raza}</ActionBadge>
                        {isPotentialDuplicate ? (
                          <ActionBadge className="border-amber-200 bg-amber-50 text-amber-800">Posible duplicado</ActionBadge>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        Microchip: <span className="font-medium text-slate-800">{patient.microchip}</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Vínculos de tutoría</p>
                    <ul className="mt-3 space-y-2">
                      {patient.clients.map((client) => (
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

      {/* Modal Crear Nuevo Paciente */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Registrar Nuevo Paciente</h2>
                <p className="mt-1 text-sm text-slate-500">Completa los datos del paciente y su tutor principal.</p>
              </div>
              <button onClick={() => setIsNewPatientModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreatePatient} className="px-5 py-5 sm:px-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nombre de Mascota</label>
                  <Input required value={newPatientForm.nombre} onChange={e => setNewPatientForm({...newPatientForm, nombre: e.target.value})} placeholder="Ej. Firulais" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Especie</label>
                    <Input required value={newPatientForm.especie} onChange={e => setNewPatientForm({...newPatientForm, especie: e.target.value})} placeholder="Ej. Canino" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Raza</label>
                    <Input required value={newPatientForm.raza} onChange={e => setNewPatientForm({...newPatientForm, raza: e.target.value})} placeholder="Ej. Poodle" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Microchip</label>
                  <Input value={newPatientForm.microchip} onChange={e => setNewPatientForm({...newPatientForm, microchip: e.target.value})} placeholder="Ej. 982 000 123" />
                </div>
                <hr className="my-2" />
                <div>
                  <label className="text-sm font-medium text-slate-700">Nombre del Tutor</label>
                  <Input required value={newPatientForm.clienteNombre} onChange={e => setNewPatientForm({...newPatientForm, clienteNombre: e.target.value})} placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">RUT del Tutor</label>
                  <Input required value={newPatientForm.clienteRut} onChange={e => setNewPatientForm({...newPatientForm, clienteRut: e.target.value})} placeholder="Ej. 12.345.678-9" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsNewPatientModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Registrar y Guardar en BD</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Check-in Existente */}
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
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="grid gap-3">
                {selectedPatient.clients.map((client) => {
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

              {activeClient && activeClient.autorizado === false ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                  <p className="text-sm font-medium">Cliente no autorizado. Seleccione una acción:</p>
                  <p className="mt-2 text-xs text-slate-600">Opciones: Emergencia, Delegación Provisoria o Traspaso de Titularidad. Actúe conforme a Ley 19.628.</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Botones de acción ajustados a variant default porque Button props no tenian danger/secondary/ghost en base al tipo esperado, pero uso los definidos por shadcn */}
                    <Button variant="destructive" onClick={handleIngresarEmergencia}>Ingresar como Emergencia</Button>
                    <Button variant="secondary" onClick={handleDelegacionProvisoria}>Delegación Provisoria</Button>
                    <Button variant="outline" onClick={handleSolicitarTraspaso}>Solicitar Traspaso</Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
              <Button variant="outline" onClick={closeModal}>
                Cancelar
              </Button>

              <Button variant={selectedClientHasDebt ? "destructive" : "default"} onClick={handleConfirmCheckIn}>
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