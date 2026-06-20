'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './clientes.module.css';

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Paciente {
  id: string;
  nombre: string;
  especie: string;
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
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', estadoCrediticio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const openEdit = (c: Cliente) => {
    setEditando(c);
    setForm({
      nombre: c.nombre,
      telefono: c.telefono ?? '',
      email: c.email ?? '',
      estadoCrediticio: c.estadoCrediticio,
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
        <input
          id="search-clientes"
          type="search"
          className={styles.searchInput}
          placeholder="Buscar por nombre o RUT…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

              {/* Botón editar */}
              <button
                id={`btn-editar-${c.id}`}
                className={styles.btnEdit}
                onClick={() => openEdit(c)}
              >
                Editar datos de contacto
              </button>
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
    </section>
  );
}

// Las clases de crédito se aplican como atributo data- para evitar limitaciones de CSS Modules con claves dinámicas
function getCrediticioClass(estado: string) {
  if (estado === 'LIMPIO') return styles.badgeAlDia;
  if (['DEUDA_TEMPRANA', 'MORA_CRONICA', 'LITIGIO_ABANDONO'].includes(estado)) return styles.badgeDeuda;
  return styles.badgeNeutro;
}