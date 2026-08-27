import { useState } from "react";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { useHogarController } from "../../../hooks/useHogarController";
import type {
  CuentaHogarItem,
  EstadoCuenta,
  PersonaUsoLibre,
  ReservaDisponible,
} from "../../../types/hogar.types";

/* ── helpers ── */
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function mesLabel(mes: string) {
  const [y, m] = mes.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

const ESTADO_COLORS: Record<EstadoCuenta, string> = {
  pendiente: "#f59e0b",
  pagada: "#00ffd1",
  vencida: "#ef4444",
};

/* ── sub-components ── */

function MonthNav({
  mes,
  onPrev,
  onNext,
}: {
  mes: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "var(--mono)",
        fontSize: 13,
      }}
    >
      <button
        onClick={onPrev}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--ink-2)",
          borderRadius: 4,
          padding: "2px 10px",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ‹
      </button>
      <span style={{ minWidth: 150, textAlign: "center", color: "var(--ink-1)", letterSpacing: "0.08em" }}>
        {mesLabel(mes)}
      </span>
      <button
        onClick={onNext}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--ink-2)",
          borderRadius: 4,
          padding: "2px 10px",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ›
      </button>
    </div>
  );
}

function CascadaRow({
  label,
  value,
  isSub,
  isTotal,
  sign = "-",
  extra,
}: {
  label: string;
  value: number;
  isSub?: boolean;
  isTotal?: boolean;
  sign?: "+" | "-" | "=";
  extra?: React.ReactNode;
}) {
  const color = isTotal
    ? value >= 0
      ? "#00ffd1"
      : "#ef4444"
    : "var(--ink-1)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
        paddingLeft: isSub ? 16 : 0,
        fontWeight: isTotal ? 700 : 400,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: isTotal ? color : "var(--ink-2)",
          fontFamily: isTotal ? "var(--mono)" : undefined,
          fontSize: isTotal ? 13 : 12,
          letterSpacing: isTotal ? "0.1em" : undefined,
          textTransform: isTotal ? "uppercase" : undefined,
        }}
      >
        <span
          style={{
            color: sign === "=" ? color : sign === "+" ? "#00ffd1" : "#ef4444",
            fontSize: 11,
            opacity: 0.7,
            minWidth: 10,
          }}
        >
          {sign}
        </span>
        {label}
        {extra}
      </span>
      <span
        style={{
          color,
          fontFamily: "var(--mono)",
          fontSize: isTotal ? 15 : 13,
          fontWeight: isTotal ? 700 : 500,
        }}
      >
        {formatCurrencyClp(value)}
      </span>
    </div>
  );
}

function CuentasSection({
  cuentas,
  onAdd,
  onEdit,
  onDelete,
}: {
  cuentas: CuentaHogarItem[];
  onAdd: (c: Omit<CuentaHogarItem, "id">) => void;
  onEdit: (id: number, c: Partial<CuentaHogarItem>) => void;
  onDelete: (id: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    monto: "",
    fechaVencimiento: "",
    estado: "pendiente" as EstadoCuenta,
    orden: 0,
  });

  function resetForm() {
    setForm({ nombre: "", monto: "", fechaVencimiento: "", estado: "pendiente", orden: 0 });
    setEditId(null);
    setShowForm(false);
  }

  function openEdit(c: CuentaHogarItem) {
    setForm({
      nombre: c.nombre,
      monto: String(c.monto),
      fechaVencimiento: c.fechaVencimiento ?? "",
      estado: c.estado,
      orden: c.orden,
    });
    setEditId(c.id);
    setShowForm(true);
  }

  function handleSubmit() {
    const payload = {
      nombre: form.nombre,
      monto: Number(form.monto),
      fechaVencimiento: form.fechaVencimiento || null,
      estado: form.estado,
      orden: form.orden,
    };
    if (editId !== null) {
      onEdit(editId, payload);
    } else {
      onAdd(payload);
    }
    resetForm();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          Cuentas del hogar
        </span>
        <button
          className="btn-cta"
          style={{ fontSize: 11, padding: "4px 12px" }}
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          + Agregar
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              placeholder="Nombre (ej: Arriendo)"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Monto"
              type="number"
              value={form.monto}
              onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <input
              type="date"
              placeholder="Vencimiento"
              value={form.fechaVencimiento}
              onChange={(e) => setForm((f) => ({ ...f, fechaVencimiento: e.target.value }))}
              style={inputStyle}
            />
            <select
              value={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoCuenta }))}
              style={inputStyle}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
            </select>
            <input
              placeholder="Orden"
              type="number"
              value={form.orden}
              onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-cta" style={{ fontSize: 11 }} onClick={handleSubmit}>
              {editId !== null ? "Guardar cambios" : "Crear cuenta"}
            </button>
            <button
              style={{ ...ghostBtnStyle, fontSize: 11 }}
              onClick={resetForm}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {cuentas.length === 0 && (
        <p style={{ color: "var(--ink-3)", fontSize: 12, fontFamily: "var(--mono)", textAlign: "center", padding: "12px 0" }}>
          Sin cuentas registradas
        </p>
      )}

      {cuentas.map((c) => (
        <div
          key={c.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: ESTADO_COLORS[c.estado],
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "var(--ink-1)", fontSize: 13 }}>{c.nombre}</span>
            {c.fechaVencimiento && (
              <span style={{ color: "var(--ink-3)", fontSize: 10, fontFamily: "var(--mono)" }}>
                vence {c.fechaVencimiento}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-1)" }}>
              {formatCurrencyClp(c.monto)}
            </span>
            <button style={iconBtnStyle} onClick={() => openEdit(c)} title="Editar">✎</button>
            <button style={{ ...iconBtnStyle, color: "#ef4444" }} onClick={() => onDelete(c.id)} title="Eliminar">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RetirosSection({
  retiros,
  reservasDisponibles,
  mes,
  onAdd,
  onDelete,
}: {
  retiros: { id: number; reservaId: number; reservaNombre: string; montoRetiro: number; descripcion: string | null }[];
  reservasDisponibles: ReservaDisponible[];
  mes: string;
  onAdd: (dto: { mes: string; reservaId: number; montoRetiro: number; descripcion?: string }) => void;
  onDelete: (id: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reservaId: "", monto: "", descripcion: "" });

  function handleAdd() {
    if (!form.reservaId || !form.monto) return;
    onAdd({
      mes,
      reservaId: Number(form.reservaId),
      montoRetiro: Number(form.monto),
      descripcion: form.descripcion || undefined,
    });
    setForm({ reservaId: "", monto: "", descripcion: "" });
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={sectionLabelStyle}>Retiros de reservas</span>
        <button className="btn-cta" style={{ fontSize: 11, padding: "4px 12px" }} onClick={() => setShowForm(!showForm)}>
          + Retiro
        </button>
      </div>

      {showForm && (
        <div style={{ ...formCardStyle, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select
              value={form.reservaId}
              onChange={(e) => setForm((f) => ({ ...f, reservaId: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Seleccionar reserva...</option>
              {reservasDisponibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({formatCurrencyClp(Number(r.monto))})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Monto a retirar"
              value={form.monto}
              onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <input
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            style={{ ...inputStyle, marginTop: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn-cta" style={{ fontSize: 11 }} onClick={handleAdd}>Registrar</button>
            <button style={{ ...ghostBtnStyle, fontSize: 11 }} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {retiros.map((r) => (
        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--ink-2)", fontSize: 12 }}>
            {r.reservaNombre}{r.descripcion ? ` · ${r.descripcion}` : ""}
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#ef4444" }}>
              -{formatCurrencyClp(r.montoRetiro)}
            </span>
            <button style={{ ...iconBtnStyle, color: "#ef4444" }} onClick={() => onDelete(r.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonaSection({
  persona,
  mes,
  onAddMovimiento,
  onDeleteMovimiento,
}: {
  persona: PersonaUsoLibre;
  mes: string;
  onAddMovimiento: (dto: { mes: string; personaIndex: number; descripcion: string; monto: number; tipoOperacion?: "INGRESO" | "GASTO"; fecha?: string }) => void;
  onDeleteMovimiento: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ descripcion: "", monto: "", tipo: "GASTO" as "INGRESO" | "GASTO" });

  function handleAdd() {
    if (!form.descripcion || !form.monto) return;
    onAddMovimiento({
      mes,
      personaIndex: persona.index,
      descripcion: form.descripcion,
      monto: Number(form.monto),
      tipoOperacion: form.tipo,
      fecha: new Date().toISOString().split("T")[0],
    });
    setForm({ descripcion: "", monto: "", tipo: "GASTO" });
    setShowForm(false);
  }

  const pct = persona.presupuesto > 0
    ? Math.max(0, Math.min(100, ((persona.presupuesto - persona.totalGastado) / persona.presupuesto) * 100))
    : 0;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--surface)",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#00ffd1" }}>
              {persona.nombre}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: persona.disponible >= 0 ? "#00ffd1" : "#ef4444", fontWeight: 700 }}>
              {formatCurrencyClp(persona.disponible)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct > 30 ? "#00ffd1" : "#ef4444", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>
            <span>Total: {formatCurrencyClp(persona.presupuesto)}</span>
            <span style={{ color: "#ef4444" }}>Gastado: {formatCurrencyClp(persona.totalGastado)}</span>
          </div>
        </div>
        <span style={{ marginLeft: 12, color: "var(--ink-3)", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Movimientos</span>
            <button className="btn-cta" style={{ fontSize: 11, padding: "4px 12px" }} onClick={() => setShowForm(!showForm)}>
              + Agregar
            </button>
          </div>

          {showForm && (
            <div style={{ ...formCardStyle, marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <input
                  placeholder="Descripción"
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={form.monto}
                  onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                  style={inputStyle}
                />
                <select
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as "INGRESO" | "GASTO" }))}
                  style={inputStyle}
                >
                  <option value="GASTO">Gasto</option>
                  <option value="INGRESO">Ingreso</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn-cta" style={{ fontSize: 11 }} onClick={handleAdd}>Guardar</button>
                <button style={{ ...ghostBtnStyle, fontSize: 11 }} onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {persona.movimientos.length === 0 && (
            <p style={{ color: "var(--ink-3)", fontSize: 12, fontFamily: "var(--mono)", textAlign: "center", padding: "8px 0" }}>
              Sin movimientos
            </p>
          )}

          {persona.movimientos.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "var(--ink-2)", fontSize: 12 }}>{m.descripcion}</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: m.tipoOperacion === "GASTO" ? "#ef4444" : "#00ffd1" }}>
                  {m.tipoOperacion === "GASTO" ? "-" : "+"}{formatCurrencyClp(m.monto)}
                </span>
                <button style={{ ...iconBtnStyle, color: "#ef4444" }} onClick={() => onDeleteMovimiento(m.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigModal({
  config,
  onSave,
  onClose,
}: {
  config: { ahorroPorcentaje: number; personasCount: number; personasNombres: string[]; gastosSemanalesMonto: number | null; gastosSemanalesSemanas: number | null };
  onSave: (dto: { ahorroPorcentaje?: number; personasCount?: number; personasNombres?: string[]; gastosSemanalesMonto?: number | null; gastosSemanalesSemanas?: number | null }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    ahorroPorcentaje: String(config.ahorroPorcentaje),
    personasCount: String(config.personasCount),
    personasNombres: [...config.personasNombres],
    gastosSemanalesMonto: config.gastosSemanalesMonto != null ? String(config.gastosSemanalesMonto) : "",
    gastosSemanalesSemanas: config.gastosSemanalesSemanas != null ? String(config.gastosSemanalesSemanas) : "",
  });

  function handlePersonasCountChange(val: string) {
    const count = Math.max(1, Number(val) || 1);
    const nombres = [...form.personasNombres];
    while (nombres.length < count) nombres.push(`Persona ${nombres.length + 1}`);
    setForm((f) => ({ ...f, personasCount: String(count), personasNombres: nombres.slice(0, count) }));
  }

  function handleSave() {
    onSave({
      ahorroPorcentaje: Number(form.ahorroPorcentaje) || 10,
      personasCount: Number(form.personasCount) || 1,
      personasNombres: form.personasNombres,
      gastosSemanalesMonto: form.gastosSemanalesMonto ? Number(form.gastosSemanalesMonto) : null,
      gastosSemanalesSemanas: form.gastosSemanalesSemanas ? Number(form.gastosSemanalesSemanas) : null,
    });
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          display: "grid",
          gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          Configuración del mes
        </div>

        <div>
          <label style={labelStyle}>Porcentaje de ahorro (%)</label>
          <input
            type="number"
            value={form.ahorroPorcentaje}
            onChange={(e) => setForm((f) => ({ ...f, ahorroPorcentaje: e.target.value }))}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Gastos semanales ($)</label>
            <input
              type="number"
              placeholder="Ej: 128000"
              value={form.gastosSemanalesMonto}
              onChange={(e) => setForm((f) => ({ ...f, gastosSemanalesMonto: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Semanas</label>
            <input
              type="number"
              placeholder="Ej: 4"
              value={form.gastosSemanalesSemanas}
              onChange={(e) => setForm((f) => ({ ...f, gastosSemanalesSemanas: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Cantidad de personas (uso libre)</label>
          <input
            type="number"
            min={1}
            max={10}
            value={form.personasCount}
            onChange={(e) => handlePersonasCountChange(e.target.value)}
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          {form.personasNombres.map((nombre, i) => (
            <input
              key={i}
              placeholder={`Nombre persona ${i + 1}`}
              value={nombre}
              onChange={(e) => {
                const nombres = [...form.personasNombres];
                nombres[i] = e.target.value;
                setForm((f) => ({ ...f, personasNombres: nombres }));
              }}
              style={{ ...inputStyle, marginBottom: 6 }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-cta" onClick={handleSave}>Guardar</button>
          <button style={ghostBtnStyle} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ── shared styles ── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "8px 10px",
  color: "var(--ink-1)",
  fontSize: 12,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const ghostBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--ink-2)",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 12,
};

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--ink-3)",
  cursor: "pointer",
  fontSize: 13,
  padding: "2px 6px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: "0.1em",
  color: "var(--ink-3)",
  textTransform: "uppercase",
  marginBottom: 6,
};

const formCardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 14,
};

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 20,
};

/* ── Main View ── */
export function HogarView() {
  const c = useHogarController();
  const [showConfig, setShowConfig] = useState(false);

  const r = c.resumen;

  if (c.resumenLoading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <MonthNav mes={c.mes} onPrev={() => c.navMes(-1)} onNext={() => c.navMes(1)} />
        <button style={ghostBtnStyle} onClick={() => setShowConfig(true)}>
          ⚙ Configurar
        </button>
      </div>

      {r && (
        <>
          {/* Presupuesto card */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Presupuesto · {mesLabel(c.mes)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Sueldo
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--ink-1)", fontWeight: 600 }}>
                  {formatCurrencyClp(r.presupuesto.sueldo)}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>Kabeli Internacional</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Abono Kim
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--ink-1)", fontWeight: 600 }}>
                  {formatCurrencyClp(r.presupuesto.abonoKim)}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>Kimberly Torres</div>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
                <div style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Total disponible
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: "#00ffd1", fontWeight: 700 }}>
                  {formatCurrencyClp(r.presupuesto.total)}
                </div>
              </div>
            </div>
          </div>

          {/* Cascada de descuentos */}
          <div style={cardStyle}>
            <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>Resumen del mes</div>

            <CascadaRow label="Presupuesto total" value={r.presupuesto.total} sign="+" />
            <CascadaRow
              label={`Ahorro (${r.config.ahorroPorcentaje}%)`}
              value={r.ahorro}
              sign="-"
            />
            <CascadaRow label="Tarjeta de crédito" value={r.montoTarjeta} sign="-" />

            {/* Cuentas collapsible */}
            <CascadaRow
              label="Cuentas del hogar"
              value={r.totalCuentas}
              sign="-"
              extra={
                r.cuentas.length > 0 && (
                  <span style={{ fontSize: 10, color: "var(--ink-3)", marginLeft: 4 }}>
                    ({r.cuentas.length})
                  </span>
                )
              }
            />
            {r.cuentas.map((c2) => (
              <CascadaRow key={c2.id} label={c2.nombre} value={c2.monto} isSub sign="-" />
            ))}

            {r.config.gastosSemanalesMonto != null && r.config.gastosSemanalesSemanas != null && (
              <CascadaRow
                label={`Gastos semanales (${r.config.gastosSemanalesSemanas} sem.)`}
                value={r.totalGastosSemanales}
                sign="-"
              />
            )}

            {r.retiros.length > 0 && (
              <CascadaRow label="Reservas retiradas" value={r.totalReservas} sign="-" />
            )}
            {r.retiros.map((rt) => (
              <CascadaRow key={rt.id} label={rt.reservaNombre} value={rt.montoRetiro} isSub sign="-" />
            ))}

            <CascadaRow label="Uso libre total" value={r.usoLibreTotal} sign="=" isTotal />
          </div>

          {/* Cuentas gestión */}
          <div style={cardStyle}>
            <CuentasSection
              cuentas={r.cuentas}
              onAdd={(dto) => c.createCuenta(dto)}
              onEdit={(id, dto) => c.updateCuenta({ id, dto })}
              onDelete={(id) => c.deleteCuenta(id)}
            />
          </div>

          {/* Retiros reservas */}
          <div style={cardStyle}>
            <RetirosSection
              retiros={r.retiros}
              reservasDisponibles={c.reservasDisponibles}
              mes={c.mes}
              onAdd={(dto) => c.createRetiro(dto)}
              onDelete={(id) => c.deleteRetiro(id)}
            />
          </div>

          {/* Uso libre por persona */}
          {r.personas.length > 0 && (
            <div style={{ display: "grid", gap: "var(--gap)" }}>
              <div style={{ ...sectionLabelStyle }}>Uso libre por persona</div>
              {r.personas.map((persona) => (
                <PersonaSection
                  key={persona.index}
                  persona={persona}
                  mes={c.mes}
                  onAddMovimiento={(dto) => c.createMovimiento(dto)}
                  onDeleteMovimiento={(id) => c.deleteMovimiento(id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!r && !c.resumenLoading && (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
          Sin datos para {mesLabel(c.mes)}
        </div>
      )}

      {showConfig && r && (
        <ConfigModal
          config={r.config}
          onSave={(dto) => c.upsertConfig(dto)}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}
