import { useIndicadoresData } from "../../../hooks/useIndicadoresData";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import type { IndicadorEconomico } from "../../../service/loginService";

const formatDateOnly = (value: string): string => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsed);
};

const formatValor = (indicador: IndicadorEconomico): string =>
  indicador.unidadMedida === "Porcentaje"
    ? `${indicador.valor} %`
    : formatCurrencyClp(indicador.valor);

/** Valores servidos desde la BD; el cron de las 08:00 los refresca. */
export const IndicadoresCard = () => {
  const { indicadores, indicadoresLoading, syncIndicadores, syncLoading } =
    useIndicadoresData();

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Indicadores económicos</div>
          <div className="card-sub">
            mindicador.cl — sincroniza diario a las 08:00
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost"
          style={{ fontSize: 12 }}
          disabled={syncLoading}
          onClick={() => syncIndicadores()}
        >
          {syncLoading ? "Actualizando…" : "Actualizar ahora"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 12,
          paddingTop: 8,
        }}
      >
        {indicadores.map((indicador) => (
          <div key={indicador.codigo}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
                marginBottom: 2,
              }}
            >
              {indicador.codigo}
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18 }}>
              {formatValor(indicador)}
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--ink-3)",
              }}
            >
              {formatDateOnly(indicador.fecha)}
            </div>
          </div>
        ))}
        {!indicadoresLoading && indicadores.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
            Sin indicadores guardados todavía.
          </p>
        )}
        {indicadoresLoading && (
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Cargando…</p>
        )}
      </div>
    </div>
  );
};
