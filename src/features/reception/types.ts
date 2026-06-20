export type Client = {
  id: string;
  nombre: string;
  rut: string;
  rol: "GARANTE_PRINCIPAL" | "SECUNDARIO" | "ACOMPANANTE_TEMPORAL";
  estadoCrediticio: "LIMPIO" | "DEUDA_TEMPRANA" | "MORA_CRONICA" | "LITIGIO_ABANDONO";
  autorizado?: boolean;
};

export type Patient = {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  microchip: string;
  clientesAsociados: Client[];
  prioridad?: "Alta" | "Media" | "Baja";
  ultimaAtencion?: string;
};

export type Toast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "warning";
};