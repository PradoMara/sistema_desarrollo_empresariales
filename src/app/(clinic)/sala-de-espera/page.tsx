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
  const [triandoId, setTriandoId] = useState<string | null>(null);

  // ── Fetch (se repite cada 5 s — polling) ──
  const fetchSala = useCallback(async () => {
    try {
      const res = await fetch('/api/sala-espera');
      if (res.ok) setLista(await res.json());
    } catch { /* silenciar */ }
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
        // Actualizar y re-ordenar: EMERGENCIA primero, luego CONTROL por fecha
        const nuevaLista = prev.map((r) => (r.id === id ? updated : r));
        return [
          ...nuevaLista.filter((r) => r.prioridadTriaje === 'EMERGENCIA'),
          ...nuevaLista.filter((r) => r.prioridadTriaje === 'CONTROL'),
        ];
      });
    }
    setTriandoId(null);
  };

  const emergencias = lista.filter((r) => r.prioridadTriaje === 'EMERGENCIA');
  const controles   = lista.filter((r) => r.prioridadTriaje === 'CONTROL');

  return (
    <section className={styles.section}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Veterinario · Vista en tiempo real</p>
          <h1 className={styles.title}>Sala de Espera</h1>
          <p className={styles.subtitle}>
            Regla D3 — Las <strong>EMERGENCIAS</strong> siempre encabezan la cola,
            rompiendo el orden FIFO.
          </p>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendEmergencia}>● Emergencia</span>
          <span className={styles.legendControl}>● Control</span>
        </div>
      </div>

      {/* Contador */}
      <div className={styles.statsRow}>
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
          <span className={styles.statLabel}>Total en sala</span>
        </div>
      </div>

      {/* Lista */}
      <div className={styles.card}>
        {loading ? (
          <p className={styles.empty}>Cargando sala de espera…</p>
        ) : lista.length === 0 ? (
          <p className={styles.empty}>La sala de espera está vacía.</p>
        ) : (
          <ul className={styles.list}>
            {lista.map((r, idx) => {
              const esEmergencia = r.prioridadTriaje === 'EMERGENCIA';
              return (
                <li
                  key={r.id}
                  className={`${styles.listItem} ${esEmergencia ? styles.itemEmergencia : styles.itemControl}`}
                >
                  {/* Número de orden */}
                  <div className={`${styles.position} ${esEmergencia ? styles.posEmergencia : styles.posControl}`}>
                    {idx + 1}
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

                  {/* Badge de triaje */}
                  <span className={`${styles.badge} ${esEmergencia ? styles.badgeEmergencia : styles.badgeControl}`}>
                    {esEmergencia ? '🚨 EMERGENCIA' : '✔ CONTROL'}
                  </span>

                  {/* Selector de triaje */}
                  <div className={styles.triaje}>
                    <p className={styles.triajeLabel}>Cambiar triaje</p>
                    <div className={styles.triajeBtns}>
                      <button
                        id={`btn-emergencia-${r.id}`}
                        className={`${styles.triajeBtn} ${esEmergencia ? styles.triajeBtnActiveRed : styles.triajeBtnRed}`}
                        disabled={esEmergencia || triandoId === r.id}
                        onClick={() => handleTriaje(r.id, 'EMERGENCIA')}
                      >
                        Emergencia
                      </button>
                      <button
                        id={`btn-control-${r.id}`}
                        className={`${styles.triajeBtn} ${!esEmergencia ? styles.triajeBtnActiveBlue : styles.triajeBtnBlue}`}
                        disabled={!esEmergencia || triandoId === r.id}
                        onClick={() => handleTriaje(r.id, 'CONTROL')}
                      >
                        Control
                      </button>
                    </div>
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
