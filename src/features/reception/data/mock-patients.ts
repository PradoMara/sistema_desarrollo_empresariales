import type { Patient } from "../types";

export const mockPatients: Patient[] = [
  {
    id: "pet-1",
    nombre: "Boby",
    especie: "Perro",
    raza: "Golden Retriever",
    microchip: "985 123 442 110 009",
    clientesAsociados: [
      { id: "client-1", nombre: "Carolina Pérez", rut: "12.345.678-9", rol: "Garante Principal", tieneDeuda: false },
    ],
  },
  {
    id: "pet-2",
    nombre: "Mishi",
    especie: "Gato",
    raza: "Siamés",
    microchip: "991 777 320 445 884",
    clientesAsociados: [
      { id: "client-2", nombre: "Marcelo Díaz", rut: "15.220.381-K", rol: "Garante Principal", tieneDeuda: true },
    ],
  },
  {
    id: "pet-3",
    nombre: "Luna",
    especie: "Perro",
    raza: "Mestiza",
    microchip: "950 610 772 901 333",
    clientesAsociados: [
      { id: "client-3", nombre: "Fernanda Soto", rut: "18.444.219-3", rol: "Garante Principal", tieneDeuda: false },
      { id: "client-4", nombre: "Tomás Soto", rut: "17.028.663-1", rol: "Secundario", tieneDeuda: false },
      { id: "client-5", nombre: "Paula Soto", rut: "19.551.004-5", rol: "Secundario", tieneDeuda: true },
    ],
  },
];