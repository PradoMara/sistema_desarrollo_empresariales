'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './clientes.module.css';

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Paciente {
  id: string;
  nombre: string;
  especie: string;
  microchip?: string;
}

interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  telefono?: string | null;
  email?: string | null;
  rol: string;
  estadoCrediticio: string;
  patients: Paciente[];
}

// ─── Componente ─────────────────────────────────────────────────────────────
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', estadoCrediticio: '', vincularPacienteId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Estados para nuevo cliente y pacientes
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ nombre: '', rut: '', telefono: '', email: '' });
  const [allPatients, setAllPatients] = useState<Paciente[]>([]);

  const fetchClientes = useCallback(async () => {
    try {
      const res = await fetch('/api/clientes');
      if (res.ok) {
        setClientes(await res.json());
      } else {
        setFetchError('Error al cargar la lista de clientes.');
      }
    } catch {
      setFetchError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        setAllPatients(await res.json());
      }
    } catch (e) {
      console.error('Error fetching patients', e);
    }
  }, []);

  useEffect(() => { 
    fetchClientes(); 
    fetchAllPatients();
  }, [fetchClientes, fetchAllPatients]);

  const openEdit = (c: Cliente) => {
    setEditando(c);
    setForm({
      nombre: c.nombre,
      telefono: c.telefono ?? '',
      email: c.email ?? '',
      estadoCrediticio: c.estadoCrediticio,
      vincularPacienteId: '',
    });
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setSaving(true);
    setError('');
    const res = await fetch(`/api/clientes/${encodeURIComponent(editando.rut)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Error al guardar los cambios.');
    } else {
      setClientes((prev) => prev.map((c) => (c.id === editando.id ? { ...c, ...data } : c)));
      setEditando(null);
    }
    setSaving(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al crear cliente.');
      } else {
        setClientes((prev) => [...prev, data]);
        setIsNewModalOpen(false);
        setNewClientForm({ nombre: '', rut: '', telefono: '', email: '' });
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rut: string) => {
    if (!window.confirm('¿Está seguro que desea eliminar este cliente y todos sus datos asociados? Esta acción no se puede deshacer.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${encodeURIComponent(rut)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setFetchError(data.error ?? 'Error al eliminar cliente.');
      } else {
        setClientes((prev) => prev.filter((c) => c.rut !== rut));
      }
    } catch {
      setFetchError('Error de conexión al eliminar.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.rut.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className={styles.section}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Gestión · Tutores</p>
          <h1 className={styles.title}>Directorio de clientes</h1>
        </div>
        <div className="flex gap-3">
          <input
            id="search-clientes"
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por nombre o RUT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            className={styles.btnPrimary} 
            onClick={() => { setIsNewModalOpen(true); setError(''); }}
          >
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className={styles.grid}>
        {fetchError ? (
          <p className={`${styles.empty} text-red-500`}>{fetchError}</p>
        ) : loading ? (
          <p className={styles.empty}>Cargando clientes…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No se encontraron clientes.</p>
        ) : (
          filtered.map((c) => (
            <article key={c.id} className={styles.card}>
              {/* Encabezado tarjeta */}
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.clientName}>{c.nombre}</p>
                  <p className={styles.clientRut}>RUT: {c.rut} · {c.rol}</p>
                </div>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${["DEUDA_TEMPRANA", "MORA_CRONICA", "LITIGIO_ABANDONO"].includes(c.estadoCrediticio) ? styles.badgeDeuda : styles.badgeAlDia}`}>
                    {["DEUDA_TEMPRANA", "MORA_CRONICA", "LITIGIO_ABANDONO"].includes(c.estadoCrediticio) ? 'Deuda' : 'Al día'}
                  </span>
                  <span className={`${styles.badge} ${getCrediticioClass(c.estadoCrediticio)}`}>
                    {c.estadoCrediticio}
                  </span>
                </div>
              </div>

              {/* Contacto */}
              <div className={styles.contactRow}>
                <span className={styles.contactItem}>📞 {c.telefono || <em>Sin teléfono</em>}</span>
                <span className={styles.contactItem}>✉️ {c.email || <em>Sin email</em>}</span>
              </div>

              {/* Mascotas */}
              {c.patients.length > 0 && (
                <div className={styles.pets}>
                  <p className={styles.petsLabel}>Mascotas asociadas</p>
                  <div className={styles.petsList}>
                    {c.patients.map((p) => (
                      <span key={p.id} className={styles.petChip}>
                        🐾 {p.nombre} ({p.especie})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  id={`btn-editar-${c.id}`}
                  className={styles.btnEdit}
                  onClick={() => openEdit(c)}
                >
                  Editar datos de contacto
                </button>
                <button
                  id={`btn-eliminar-${c.id}`}
                  className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 sm:w-auto"
                  onClick={() => handleDelete(c.rut)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal Editar */}
      {editando && (
        <div className={styles.overlay} onClick={() => setEditando(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar tutor — {editando.rut}</h2>
              <button className={styles.closeBtn} onClick={() => setEditando(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.form}>
              {error && <p className={styles.errorMsg}>{error}</p>}

              <label className={styles.label}>
                Nombre completo
                <input
                  id="edit-nombre"
                  className={styles.input}
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </label>
              <label className={styles.label}>
                Teléfono
                <input
                  id="edit-telefono"
                  type="tel"
                  className={styles.input}
                  placeholder="+56 9 1234 5678"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Email
                <input
                  id="edit-email"
                  type="email"
                  className={styles.input}
                  placeholder="correo@ejemplo.cl"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Estado crediticio
                <select
                  id="edit-crediticio"
                  className={styles.select}
                  value={form.estadoCrediticio}
                  onChange={(e) => setForm({ ...form, estadoCrediticio: e.target.value })}
                >
                  <option value="LIMPIO">LIMPIO</option>
                  <option value="DEUDA_TEMPRANA">DEUDA_TEMPRANA</option>
                  <option value="MORA_CRONICA">MORA_CRONICA</option>
                  <option value="LITIGIO_ABANDONO">LITIGIO_ABANDONO</option>
                </select>
              </label>

              <label className={styles.label}>
                Vincular Mascota Existente (Opcional)
                <select
                  className={styles.select}
                  value={form.vincularPacienteId}
                  onChange={(e) => setForm({ ...form, vincularPacienteId: e.target.value })}
                >
                  <option value="">Seleccione una mascota para vincular...</option>
                  {allPatients
                    .filter(p => !editando.patients.some(ep => ep.id === p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.especie})</option>
                    ))}
                </select>
              </label>
              <div className={styles.formActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button id="btn-guardar-cliente" type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {isNewModalOpen && (
        <div className={styles.overlay} onClick={() => setIsNewModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Registrar Nuevo Tutor</h2>
              <button className={styles.closeBtn} onClick={() => setIsNewModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClient} className={styles.form}>
              {error && <p className={styles.errorMsg}>{error}</p>}

              <label className={styles.label}>
                Nombre completo
                <input
                  required
                  className={styles.input}
                  value={newClientForm.nombre}
                  onChange={(e) => setNewClientForm({ ...newClientForm, nombre: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                RUT
                <input
                  required
                  className={styles.input}
                  placeholder="Ej. 12.345.678-9"
                  value={newClientForm.rut}
                  onChange={(e) => setNewClientForm({ ...newClientForm, rut: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Teléfono
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="+56 9 1234 5678"
                  value={newClientForm.telefono}
                  onChange={(e) => setNewClientForm({ ...newClientForm, telefono: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Email
                <input
                  type="email"
                  className={styles.input}
                  placeholder="correo@ejemplo.cl"
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                />
              </label>
              <div className={styles.formActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsNewModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Guardando…' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// Las clases de crédito se aplican como atributo data- para evitar limitaciones de CSS Modules con claves dinámicas
function getCrediticioClass(estado: string) {
  if (estado === 'LIMPIO') return styles.badgeAlDia;
  if (['DEUDA_TEMPRANA', 'MORA_CRONICA', 'LITIGIO_ABANDONO'].includes(estado)) return styles.badgeDeuda;
  return styles.badgeNeutro;
}