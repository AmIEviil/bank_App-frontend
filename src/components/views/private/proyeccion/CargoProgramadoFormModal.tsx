import { useState } from "react";
import type {
  CargoProgramado,
  CargoProgramadoTipo,
  CreateCargoProgramadoDto,
} from "../../../../service/loginService";

interface CargoProgramadoFormModalProps {
  cargo?: CargoProgramado | null;
  loading: boolean;
  onSave: (dto: CreateCargoProgramadoDto) => void;
  onCancel: () => void;
}

const TIPO_OPTIONS: Array<{
  value: CargoProgramadoTipo;
  label: string;
  hint: string;
}> = [
  {
    value: "CUOTA",
    label: "Cuota",
    hint: "Compra en cuotas que el crawler no detecta (ej: avance, compra en otra tarjeta).",
  },
  {
    value: "RECURRENTE",
    label: "Recurrente",
    hint: "Cargo fijo que se repite todos los meses (ej: Tidal, HBO Max, Duoc).",
  },
  {
    value: "AJUSTE",
    label: "Pago negativo",
    hint: "Reembolso de terceros o prepago. Se registra en positivo y se resta del total.",
  },
];

const currentMonthKey = (): string => new Date().toISOString().slice(0, 7);

const toFormState = (cargo?: CargoProgramado | null): CreateCargoProgramadoDto => {
  if (!cargo) {
    return {
      nombre: "",
      montoCuota: 0,
      tipo: "CUOTA",
      mesReferencia: currentMonthKey(),
      cuotaActual: 1,
      cantCuotas: 1,
      moneda: "CLP",
      notas: "",
    };
  }

  return {
    nombre: cargo.nombre,
    montoCuota: Math.abs(Number(cargo.montoCuota)),
    tipo: cargo.tipo,
    mesReferencia: cargo.mesReferencia,
    cuotaActual: cargo.cuotaActual,
    cantCuotas: cargo.cantCuotas,
    moneda: cargo.moneda,
    notas: cargo.notas ?? "",
    tarjetaId: cargo.tarjetaId ?? null,
    activo: cargo.activo,
  };
};

const fieldStyle: React.CSSProperties = { display: "grid", gap: 5 };
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
};
const inputStyle: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--line)",
  borderRadius: 9,
  padding: "9px 12px",
  outline: 0,
  color: "var(--ink-0)",
  fontSize: 13,
  width: "100%",
};

export function CargoProgramadoFormModal({
  cargo,
  loading,
  onSave,
  onCancel,
}: CargoProgramadoFormModalProps) {
  const [form, setForm] = useState<CreateCargoProgramadoDto>(() =>
    toFormState(cargo),
  );

  const set = <K extends keyof CreateCargoProgramadoDto>(
    key: K,
    value: CreateCargoProgramadoDto[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const isRecurrente = form.tipo === "RECURRENTE";
  const activeHint =
    TIPO_OPTIONS.find((option) => option.value === form.tipo)?.hint ?? "";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...form,
      nombre: form.nombre.trim(),
      montoCuota: Math.abs(Number(form.montoCuota) || 0),
      cuotaActual: isRecurrente ? 0 : Number(form.cuotaActual) || 1,
      cantCuotas: isRecurrente
        ? Number(form.cantCuotas) || 0
        : Number(form.cantCuotas) || 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
      <div style={fieldStyle}>
        <span style={labelStyle}>Tipo de cargo</span>
        <div style={{ display: "flex", gap: 8 }}>
          {TIPO_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => set("tipo", option.value)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                fontSize: 11,
                fontFamily: "var(--mono)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background:
                  form.tipo === option.value ? "var(--accent)" : "var(--bg-2)",
                color: form.tipo === option.value ? "#04150f" : "var(--ink-2)",
                border:
                  form.tipo === option.value
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line)",
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{activeHint}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={fieldStyle}>
          <span style={labelStyle}>Nombre</span>
          <input
            required
            value={form.nombre}
            onChange={(event) => set("nombre", event.target.value)}
            placeholder="Ej: Duoc Julio / $ x pagar cuota Rush"
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>
            {form.tipo === "AJUSTE" ? "Monto a restar" : "Monto cuota"}
          </span>
          <input
            required
            type="number"
            min={1}
            value={form.montoCuota || ""}
            onChange={(event) => set("montoCuota", Number(event.target.value))}
            placeholder="27625"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div style={fieldStyle}>
          <span style={labelStyle}>Mes referencia</span>
          <input
            required
            type="month"
            value={form.mesReferencia}
            onChange={(event) => set("mesReferencia", event.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Cuota actual</span>
          <input
            type="number"
            min={isRecurrente ? 0 : 1}
            disabled={isRecurrente}
            value={isRecurrente ? 0 : (form.cuotaActual ?? 1)}
            onChange={(event) => set("cuotaActual", Number(event.target.value))}
            style={{ ...inputStyle, opacity: isRecurrente ? 0.5 : 1 }}
          />
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>
            {isRecurrente ? "Meses (0 = sin fin)" : "Cant. cuotas"}
          </span>
          <input
            type="number"
            min={0}
            value={form.cantCuotas ?? (isRecurrente ? 0 : 1)}
            onChange={(event) => set("cantCuotas", Number(event.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <div style={fieldStyle}>
          <span style={labelStyle}>Moneda</span>
          <select
            value={form.moneda ?? "CLP"}
            onChange={(event) =>
              set("moneda", event.target.value === "USD" ? "USD" : "CLP")
            }
            style={inputStyle}
          >
            <option value="CLP">CLP</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Nota</span>
          <input
            value={form.notas ?? ""}
            onChange={(event) => set("notas", event.target.value)}
            placeholder="Ej: Kim paga la mitad"
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          paddingTop: 4,
        }}
      >
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
          style={{ width: "auto", flex: "unset", padding: "9px 20px" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: "auto", flex: "unset", padding: "9px 20px" }}
        >
          {loading ? "Guardando…" : cargo ? "Actualizar cargo" : "Guardar cargo"}
        </button>
      </div>
    </form>
  );
}
