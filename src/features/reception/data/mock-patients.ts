import type { Patient } from "../types";

// Mocks ampliados para cubrir casos: limpio, moroso, no autorizado y prioridad alta
export const mockPatients: Patient[] = [
  {
    id: "pet-1",
    nombre: "Boby",
    especie: "Perro",
    raza: "Golden Retriever",
    microchip: "985 123 442 110 009",
    prioridad: "Baja",
    ultimaAtencion: "2026-05-01",
    clientesAsociados: [
      { id: "client-1", nombre: "Carolina Pérez", rut: "12.345.678-9", rol: "GARANTE_PRINCIPAL", estadoCrediticio: "LIMPIO", autorizado: true },
    ],
  },
  {
    id: "pet-2",
    nombre: "Mishi",
    especie: "Gato",
    raza: "Siamés",
    microchip: "991 777 320 445 884",
    prioridad: "Media",
    ultimaAtencion: "2026-04-15",
    clientesAsociados: [
      // Garante moroso — activa la rama Urgencia
      { id: "client-2", nombre: "Marcelo Díaz", rut: "15.220.381-K", rol: "GARANTE_PRINCIPAL", estadoCrediticio: "DEUDA_TEMPRANA", autorizado: true },
    ],
  },
  {
    id: "pet-3",
    nombre: "Luna",
    especie: "Perro",
    raza: "Mestiza",
    microchip: "950 610 772 901 333",
    prioridad: "Alta",
    ultimaAtencion: "2026-05-10",
    clientesAsociados: [
      { id: "client-3", nombre: "Fernanda Soto", rut: "18.444.219-3", rol: "GARANTE_PRINCIPAL", estadoCrediticio: "LIMPIO", autorizado: true },
      { id: "client-4", nombre: "Tomás Soto", rut: "17.028.663-1", rol: "SECUNDARIO", estadoCrediticio: "LIMPIO", autorizado: true },
      // Cliente no autorizado (simula E2)
      { id: "client-external", nombre: "Persona Externa", rut: "--", rol: "ACOMPANANTE_TEMPORAL", estadoCrediticio: "LIMPIO", autorizado: false },
    ],
  },
];