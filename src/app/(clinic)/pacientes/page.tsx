'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './pacientes.module.css';

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  rol: string;
  estadoCrediticio: string;
}

interface Paciente {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo?: string | null;
  microchip: string;
  codigoMicrochip?: string | null;
  estadoFicha: string;   // PENDIENTE_VALIDACION | ACTIVA
  estadoCuenta: string;
  clients: Cliente[];
}

// ─── Componente ─────────────────────────────────────────────────────────────
export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activandoId, setActivandoId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPacientes = useCallback(async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        setPacientes(await res.json());
      } else {
        setError('Error al cargar la lista de pacientes.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPacientes(); }, [fetchPacientes]);

  // ── Activar Ficha (RN7) ──
  const handleActivar = async (id: string) => {
    setActivandoId(id);
    const res = await fetch(`/api/pacientes/${id}/activar`, { method: 'PATCH' });
    if (res.ok) {
      const updated: Paciente = await res.json();
      setPacientes((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    }
    setActivandoId(null);
  };

  const filtered = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.microchip.toLowerCase().includes(search.toLowerCase()) ||
    p.clients.some((c) => c.rut.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <section className={styles.section}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Gestión · Fichas clínicas</p>
          <h1 className={styles.title}>Pacientes registrados</h1>
        </div>
        <input
          id="search-pacientes"
          type="search"
          className={styles.searchInput}
          placeholder="Buscar por nombre, microchip o RUT…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className={styles.grid}>
        {error ? (
          <p className={`${styles.empty} text-red-500`}>{error}</p>
        ) : loading ? (
          <p className={styles.empty}>Cargando pacientes…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No se encontraron pacientes.</p>
        ) : (
          filtered.map((p) => {
            const fichaActiva = p.estadoFicha === 'ACTIVA';
            return (
              <article key={p.id} className={styles.card}>
                {/* Cabecera tarjeta */}
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.patientName}>{p.nombre}</p>
                    <p className={styles.patientMeta}>{p.especie} · {p.raza}</p>
                  </div>
                  <span className={`${styles.fichaBadge} ${fichaActiva ? styles.fichaActiva : styles.fichaPendiente}`}>
                    {fichaActiva ? '✓ Ficha Activa' : '⏳ Pendiente validación'}
                  </span>
                </div>

                {/* Detalles */}
                <div className={styles.details}>
                  <span className={styles.chip}>Microchip: {p.microchip || p.codigoMicrochip || '—'}</span>
                  {p.sexo && <span className={styles.chip}>Sexo: {p.sexo}</span>}
                  <span className={`${styles.chip} ${p.estadoCuenta === 'AL_DIA' ? styles.chipGreen : styles.chipRed}`}>
                    Cuenta: {p.estadoCuenta.replace('_', ' ')}
                  </span>
                </div>

                {/* Tutores */}
                {p.clients.length > 0 && (
                  <div className={styles.clients}>
                    <p className={styles.clientsLabel}>Tutores asociados</p>
                    <ul className={styles.clientList}>
                      {p.clients.map((c) => (
                        <li key={c.id} className={styles.clientItem}>
                          <div>
                            <span className={styles.clientName}>{c.nombre}</span>
                            <span className={styles.clientRut}> — {c.rut}</span>
                          </div>
                          <span className={`${styles.deudaBadge} ${["DEUDA_TEMPRANA", "MORA_CRONICA", "LITIGIO_ABANDONO"].includes(c.estadoCrediticio) ? styles.deuda : styles.alDia}`}>
                            {["DEUDA_TEMPRANA", "MORA_CRONICA", "LITIGIO_ABANDONO"].includes(c.estadoCrediticio) ? 'Deuda' : 'Al día'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Acción: Activar Ficha */}
                {!fichaActiva && (
                  <div className={styles.activarSection}>
                    <p className={styles.activarHint}>
                      Activar ficha simula la firma de la Declaración de Propiedad (RN7).
                    </p>
                    <button
                      id={`btn-activar-${p.id}`}
                      className={styles.btnActivar}
                      disabled={activandoId === p.id}
                      onClick={() => handleActivar(p.id)}
                    >
                      {activandoId === p.id ? 'Activando…' : 'Activar Ficha'}
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}