'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './agenda.module.css';

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
  telefono?: string | null;
  email?: string | null;
}

interface Reserva {
  id: string;
  fecha: string;
  estado: string;
  prioridadTriaje: string;
  notas?: string | null;
  paciente: Paciente;
  cliente: Cliente;
}

const ESTADO_LABELS: Record<string, string> = {
  SOLICITUD_PENDIENTE: 'Pendiente',
  RESERVADO: 'Reservado',
  SALA_ESPERA: 'En Sala',
  EN_ATENCION: 'En Atención',
  FINALIZADO: 'Finalizado',
};

const ESTADO_CLASS: Record<string, string> = {
  SOLICITUD_PENDIENTE: styles.badgePending,
  RESERVADO: styles.badgeReserved,
  SALA_ESPERA: styles.badgeWaiting,
  EN_ATENCION: styles.badgeActive,
  FINALIZADO: styles.badgeDone,
};

// ─── Componente ─────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState<string | null>(null);

  // Formulario nueva reserva
  const [form, setForm] = useState({
    pacienteId: '',
    clienteId: '',
    fecha: '',
    notas: '',
  });

  // ── Fetch ──
  const fetchAll = useCallback(async () => {
    try {
      const [rRes, pRes, cRes] = await Promise.all([
        fetch('/api/reservas'),
        fetch('/api/patients'),
        fetch('/api/clientes'),
      ]);
      if (rRes.ok) setReservas(await rRes.json());
      if (pRes.ok) setPacientes(await pRes.json());
      if (cRes.ok) setClientes(await cRes.json());
      
      if (!rRes.ok || !pRes.ok || !cRes.ok) {
        setError('Algunos datos no se pudieron cargar correctamente.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Crear Reserva ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Error al crear la reserva.');
      return;
    }
    setReservas((prev) => [...prev, data]);
    setIsModalOpen(false);
    setForm({ pacienteId: '', clienteId: '', fecha: '', notas: '' });
  };

  // ── Check-in ──
  const handleCheckIn = async (id: string) => {
    setCheckInLoading(id);
    const res = await fetch(`/api/reservas/${id}/checkin`, { method: 'PATCH' });
    if (res.ok) {
      const updated: Reserva = await res.json();
      setReservas((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
    setCheckInLoading(null);
  };

  // ── Render ──
  return (
    <section className={styles.section}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Recepcionista · Agenda</p>
          <h1 className={styles.title}>Citas programadas</h1>
        </div>
        <button
          id="btn-nueva-reserva"
          className={styles.btnPrimary}
          onClick={() => setIsModalOpen(true)}
        >
          + Nueva reserva
        </button>
      </div>

      {/* Lista */}
      <div className={styles.card}>
        {loading ? (
          <p className={styles.empty}>Cargando citas…</p>
        ) : reservas.length === 0 ? (
          <p className={styles.empty}>No hay reservas registradas.</p>
        ) : (
          <ul className={styles.list}>
            {reservas.map((r) => (
              <li key={r.id} className={styles.listItem}>
                <div className={styles.listMain}>
                  <div>
                    <p className={styles.patientName}>{r.paciente.nombre}</p>
                    <p className={styles.meta}>
                      {r.paciente.especie} · Tutor: <strong>{r.cliente.nombre}</strong> ({r.cliente.rut})
                    </p>
                    <p className={styles.date}>
                      {new Date(r.fecha).toLocaleString('es-CL', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <span className={`${styles.badge} ${ESTADO_CLASS[r.estado] ?? ''}`}>
                      {ESTADO_LABELS[r.estado] ?? r.estado}
                    </span>

                    {(r.estado === 'SOLICITUD_PENDIENTE' || r.estado === 'RESERVADO') && (
                      <button
                        id={`btn-checkin-${r.id}`}
                        className={styles.btnCheckin}
                        disabled={checkInLoading === r.id}
                        onClick={() => handleCheckIn(r.id)}
                      >
                        {checkInLoading === r.id ? 'Procesando…' : 'Hacer Check-in ✓'}
                      </button>
                    )}

                    {r.estado === 'SALA_ESPERA' && (
                      <span className={styles.inRoom}>En sala de espera</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Nueva Reserva */}
      {isModalOpen && (
        <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nueva Reserva</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <p className={styles.errorMsg}>{error}</p>}

              <label className={styles.label}>
                Paciente
                <select
                  id="select-paciente"
                  required
                  className={styles.select}
                  value={form.pacienteId}
                  onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}
                >
                  <option value="">Seleccionar paciente…</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.especie})
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                Tutor / Cliente
                <select
                  id="select-cliente"
                  required
                  className={styles.select}
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                >
                  <option value="">Seleccionar tutor…</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} — {c.rut}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                Fecha y hora
                <input
                  id="input-fecha"
                  type="datetime-local"
                  required
                  className={styles.input}
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </label>

              <label className={styles.label}>
                Notas (opcional)
                <textarea
                  id="input-notas"
                  rows={3}
                  className={styles.textarea}
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  placeholder="Motivo de consulta, indicaciones previas…"
                />
              </label>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button id="btn-confirmar-reserva" type="submit" className={styles.btnPrimary}>
                  Confirmar reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}