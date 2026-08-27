import { useState, useEffect } from "react";
import type {
  TarjetaBancaria,
  CreateTarjetaDto,
  DataSourceItem,
} from "../../service/loginService";

const DATA_SOURCE_LABELS: Record<string, string> = {
  BANCO_CHILE_CC: "Banco Chile — Cuenta Corriente",
  BANCO_CHILE_TC: "Banco Chile — Tarjeta de Crédito",
  GMAIL: "Gmail",
  MERCADO_PAGO: "MercadoPago",
};

interface TarjetaFormModalProps {
  tarjeta?: TarjetaBancaria | null;
  dataSources: DataSourceItem[];
  defaultDataSourceId?: number | null;
  loading: boolean;
  onSave: (dto: CreateTarjetaDto) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CreateTarjetaDto = {
  nombre: "",
  nroTarjeta: "",
  tipoTarjeta: "credito",
  dataSourceId: null,
  montoTotal: null,
  montoUtilizado: null,
  fechaFacturacion: null,
};

function computeFechaPago(diaFacturacion: number): string {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();
  let closeDay = diaFacturacion;

  if (today.getDate() > closeDay) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  const closeDate = new Date(year, month, closeDay);
  const payDate = new Date(closeDate.getTime() + 20 * 24 * 60 * 60 * 1000);

  return payDate.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function TarjetaFormModal({
  tarjeta,
  dataSources,
  defaultDataSourceId,
  loading,
  onSave,
  onCancel,
}: TarjetaFormModalProps) {
  const [form, setForm] = useState<CreateTarjetaDto>(() => {
    if (tarjeta) {
      return {
        nombre: tarjeta.nombre,
        nroTarjeta: tarjeta.nroTarjeta,
        tipoTarjeta: tarjeta.tipoTarjeta,
        dataSourceId: tarjeta.dataSourceId ?? null,
        montoTotal: tarjeta.montoTotal ?? null,
        montoUtilizado: tarjeta.montoUtilizado ?? null,
        fechaFacturacion: tarjeta.fechaFacturacion ?? null,
      };
    }
    return { ...EMPTY_FORM, dataSourceId: defaultDataSourceId ?? null };
  });

  useEffect(() => {
    if (tarjeta) {
      setForm({
        nombre: tarjeta.nombre,
        nroTarjeta: tarjeta.nroTarjeta,
        tipoTarjeta: tarjeta.tipoTarjeta,
        dataSourceId: tarjeta.dataSourceId ?? null,
        montoTotal: tarjeta.montoTotal ?? null,
        montoUtilizado: tarjeta.montoUtilizado ?? null,
        fechaFacturacion: tarjeta.fechaFacturacion ?? null,
      });
    } else {
      setForm({ ...EMPTY_FORM, dataSourceId: defaultDataSourceId ?? null });
    }
  }, [tarjeta, defaultDataSourceId]);

  const isCredito = form.tipoTarjeta === "credito";
  const fechaPagoPreview =
    isCredito && form.fechaFacturacion
      ? computeFechaPago(form.fechaFacturacion)
      : null;

  const set = <K extends keyof CreateTarjetaDto>(
    key: K,
    value: CreateTarjetaDto[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateTarjetaDto = {
      ...form,
      montoTotal: isCredito ? form.montoTotal : null,
      montoUtilizado: isCredito ? form.montoUtilizado : null,
      fechaFacturacion: isCredito ? form.fechaFacturacion : null,
    };
    onSave(payload);
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

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
      {/* Data source */}
      <div style={fieldStyle}>
        <span style={labelStyle}>Fuente vinculada</span>
        <select
          value={form.dataSourceId ?? ""}
          onChange={(e) =>
            set("dataSourceId", e.target.value ? Number(e.target.value) : null)
          }
          style={inputStyle}
        >
          <option value="">Sin vincular</option>
          {dataSources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {DATA_SOURCE_LABELS[ds.tipo] ?? ds.tipo} — {ds.identificador}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo */}
      <div style={fieldStyle}>
        <span style={labelStyle}>Tipo de tarjeta</span>
        <div style={{ display: "flex", gap: 8 }}>
          {(["credito", "debito"] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => set("tipoTarjeta", tipo)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                fontSize: 12,
                fontFamily: "var(--mono)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background:
                  form.tipoTarjeta === tipo ? "var(--accent)" : "var(--bg-2)",
                color: form.tipoTarjeta === tipo ? "#04150f" : "var(--ink-2)",
                border:
                  form.tipoTarjeta === tipo
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line)",
                cursor: "pointer",
              }}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* 2-col: nombre + nro */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldStyle}>
          <span style={labelStyle}>Nombre / alias</span>
          <input
            required
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Ej: Visa Banco Chile"
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Nro. tarjeta (últimos 4)</span>
          <input
            required
            value={form.nroTarjeta}
            onChange={(e) => set("nroTarjeta", e.target.value)}
            placeholder="•••• •••• •••• 1234"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Credit-only fields */}
      {isCredito && (
        <>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={fieldStyle}>
              <span style={labelStyle}>Monto total (límite CLP)</span>
              <input
                type="number"
                value={form.montoTotal ?? ""}
                onChange={(e) =>
                  set(
                    "montoTotal",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="1000000"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Monto utilizado CLP</span>
              <input
                type="number"
                value={form.montoUtilizado ?? ""}
                onChange={(e) =>
                  set(
                    "montoUtilizado",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="350000"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Día de cierre de ciclo (1-31)</span>
            <input
              type="number"
              min={1}
              max={31}
              value={form.fechaFacturacion ?? ""}
              onChange={(e) =>
                set(
                  "fechaFacturacion",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="Ej: 15"
              style={inputStyle}
            />
            {fechaPagoPreview && (
              <div
                style={{
                  marginTop: 6,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(124,243,196,0.07)",
                  border: "1px solid rgba(124,243,196,0.2)",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--gain)",
                }}
              >
                Ciclo cierra día {form.fechaFacturacion} · Pago vence ~
                {fechaPagoPreview}
                <span
                  style={{
                    display: "block",
                    color: "var(--ink-3)",
                    marginTop: 2,
                    fontSize: 10,
                  }}
                >
                  Banco Chile: cierre mensual → cuota pagadera 20 días después
                  (hasta 45 días sin interés)
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Actions */}
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
          {loading
            ? "Guardando…"
            : tarjeta
              ? "Actualizar tarjeta"
              : "Guardar tarjeta"}
        </button>
      </div>
    </form>
  );
}
