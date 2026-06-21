'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './sala-espera.module.css';

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Paciente {
  id: string;
  nombre: string;
  especie: string;
  estadoFicha: string;
}

interface Cliente {
  id: string;
  nombre: string;
  rut: string;
}

interface Reserva {
  id: string;
  fecha: string;
  estado: string;
  prioridadTriaje: 'EMERGENCIA' | 'CONTROL';
  paciente: Paciente;
  cliente: Cliente;
}

// ─── Componente ─────────────────────────────────────────────────────────────
export default function SalaDeEsperaPage() {
  const [lista, setLista] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triandoId, setTriandoId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Fetch (se repite cada 5 s — polling) ──
  const fetchSala = useCallback(async () => {
    try {
      const res = await fetch('/api/sala-espera');
      if (res.ok) {
        setLista(await res.json());
        setError(null);
      } else {
        setError('Error al cargar datos desde el servidor.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchSala();
    const interval = setInterval(fetchSala, 5000);
    return () => clearInterval(interval);
  }, [fetchSala]);

  // ── Cambiar triaje ──
  const handleTriaje = async (id: string, prioridadTriaje: 'EMERGENCIA' | 'CONTROL') => {
    setTriandoId(id);
    const res = await fetch(`/api/reservas/${id}/triaje`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prioridadTriaje }),
    });
    if (res.ok) {
      const updated: Reserva = await res.json();
      setLista((prev) => {
        const nuevaLista = prev.map((r) => (r.id === id ? updated : r));
        return [
          ...nuevaLista.filter((r) => r.estado === 'EN_ATENCION'),
          ...nuevaLista.filter((r) => r.estado === 'SALA_ESPERA' && r.prioridadTriaje === 'EMERGENCIA'),
          ...nuevaLista.filter((r) => r.estado === 'SALA_ESPERA' && r.prioridadTriaje === 'CONTROL'),
        ];
      });
    }
    setTriandoId(null);
  };

  const handleAtender = async (id: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/reservas/${id}/atender`, { method: 'PATCH' });
    if (res.ok) {
      await fetchSala();
    }
    setActionLoading(null);
  };

  const handleFinalizar = async (id: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/reservas/${id}/finalizar`, { method: 'PATCH' });
    if (res.ok) {
      await fetchSala();
    }
    setActionLoading(null);
  };

  const enAtencion = lista.filter((r) => r.estado === 'EN_ATENCION');
  const emergencias = lista.filter((r) => r.estado === 'SALA_ESPERA' && r.prioridadTriaje === 'EMERGENCIA');
  const controles = lista.filter((r) => r.estado === 'SALA_ESPERA' && r.prioridadTriaje === 'CONTROL');

  return (
    <section className={styles.section}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Veterinario · Vista en tiempo real</p>
          <h1 className={styles.title}>Sala de Espera y Box</h1>
          <p className={styles.subtitle}>
            Regla D3 — Las <strong>EMERGENCIAS</strong> siempre encabezan la cola en sala de espera.
          </p>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendAtencion}>● En Atención</span>
          <span className={styles.legendEmergencia}>● Emergencia</span>
          <span className={styles.legendControl}>● Control</span>
        </div>
      </div>

      {/* Contador */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statAtencion}`}>
          <span className={styles.statNum}>{enAtencion.length}</span>
          <span className={styles.statLabel}>En Box</span>
        </div>
        <div className={`${styles.statCard} ${styles.statEmergencia}`}>
          <span className={styles.statNum}>{emergencias.length}</span>
          <span className={styles.statLabel}>Emergencias</span>
        </div>
        <div className={`${styles.statCard} ${styles.statControl}`}>
          <span className={styles.statNum}>{controles.length}</span>
          <span className={styles.statLabel}>Controles</span>
        </div>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <span className={styles.statNum}>{lista.length}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
      </div>

      {/* Lista */}
      <div className={styles.card}>
        {error ? (
          <p className={`${styles.empty} text-red-500`}>{error}</p>
        ) : loading ? (
          <p className={styles.empty}>Cargando datos…</p>
        ) : lista.length === 0 ? (
          <p className={styles.empty}>No hay pacientes en sala de espera ni en atención.</p>
        ) : (
          <ul className={styles.list}>
            {lista.map((r, idx) => {
              const esAtencion = r.estado === 'EN_ATENCION';
              const esEmergencia = r.prioridadTriaje === 'EMERGENCIA' && !esAtencion;
              
              const itemClass = esAtencion ? styles.itemAtencion : (esEmergencia ? styles.itemEmergencia : styles.itemControl);
              const posClass = esAtencion ? styles.posAtencion : (esEmergencia ? styles.posEmergencia : styles.posControl);
              const badgeClass = esAtencion ? styles.badgeAtencion : (esEmergencia ? styles.badgeEmergencia : styles.badgeControl);

              return (
                <li key={r.id} className={`${styles.listItem} ${itemClass}`}>
                  {/* Número de orden o icono de Box */}
                  <div className={`${styles.position} ${posClass}`}>
                    {esAtencion ? 'B' : idx + 1 - enAtencion.length}
                  </div>

                  {/* Datos */}
                  <div className={styles.info}>
                    <p className={styles.patientName}>{r.paciente.nombre}</p>
                    <p className={styles.meta}>
                      {r.paciente.especie} · Tutor: <strong>{r.cliente.nombre}</strong>
                    </p>
                    <p className={styles.time}>
                      Llegada:{' '}
                      {new Date(r.fecha).toLocaleString('es-CL', {
                        timeStyle: 'short',
                        dateStyle: 'short',
                      })}
                    </p>
                  </div>

                  {/* Badge de estado/triaje */}
                  <span className={`${styles.badge} ${badgeClass}`}>
                    {esAtencion ? '🏥 EN ATENCIÓN' : (esEmergencia ? '🚨 EMERGENCIA' : '✔ CONTROL')}
                  </span>

                  {/* Acciones */}
                  <div className={styles.triaje}>
                    {esAtencion ? (
                      <>
                        <p className={styles.triajeLabel}>Acciones de Box</p>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                          onClick={() => handleFinalizar(r.id)}
                          disabled={actionLoading === r.id}
                        >
                          {actionLoading === r.id ? 'Cerrando...' : 'Dar de Alta ✓'}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={styles.triajeLabel}>Triaje y Box</p>
                        <div className={styles.triajeBtns}>
                          <button
                            className={`${styles.triajeBtn} ${esEmergencia ? styles.triajeBtnActiveRed : styles.triajeBtnRed}`}
                            disabled={esEmergencia || triandoId === r.id || actionLoading === r.id}
                            onClick={() => handleTriaje(r.id, 'EMERGENCIA')}
                          >
                            Emergencia
                          </button>
                          <button
                            className={`${styles.triajeBtn} ${!esEmergencia ? styles.triajeBtnActiveBlue : styles.triajeBtnBlue}`}
                            disabled={!esEmergencia || triandoId === r.id || actionLoading === r.id}
                            onClick={() => handleTriaje(r.id, 'CONTROL')}
                          >
                            Control
                          </button>
                          <button 
                            className={styles.actionBtn}
                            onClick={() => handleAtender(r.id)}
                            disabled={actionLoading === r.id}
                            title="Ingresar paciente al Box de Atención"
                          >
                            {actionLoading === r.id ? '...' : 'Atender'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Nota informativa */}
      <p className={styles.note}>
        ⟳ Lista actualizada automáticamente cada 5 segundos.
      </p>
    </section>
  );
}
