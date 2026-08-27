import type { ResumeData } from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { formatDateTime } from "../../../utils/dateUtils";

interface ResumenViewProps {
  resumen: ResumeData;
  sourceMax: number;
}

export const ResumenView = ({ resumen, sourceMax }: ResumenViewProps) => {
  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      <div className="grid-2-col">
        {/* Source distribution */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Por fuente</div>
              <div className="card-sub">Distribución de movimientos</div>
            </div>
          </div>
          <div className="bars-list">
            {resumen.bySource.map((item) => {
              const pct = sourceMax > 0 ? (item.amount / sourceMax) * 100 : 0;
              return (
                <div key={item.label} style={{ display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--ink-1)" }}>{item.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-0)" }}>
                      {formatCurrencyClp(item.amount)}
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.max(pct, 6)}%`, background: "var(--accent)" }} />
                  </div>
                </div>
              );
            })}
            {resumen.bySource.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Sin fuentes vinculadas con movimientos.</p>
            )}
          </div>
        </div>

        {/* Category distribution */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Por categoría</div>
              <div className="card-sub">Top {resumen.byCategory.length} categorías</div>
            </div>
          </div>
          <div className="bars-list">
            {resumen.byCategory.slice(0, 8).map((item) => {
              const max = resumen.byCategory[0]?.amount || 1;
              const pct = (item.amount / max) * 100;
              return (
                <div key={item.label} style={{ display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--ink-1)" }}>{item.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-0)" }}>
                      {formatCurrencyClp(item.amount)}
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.max(pct, 6)}%` }} />
                  </div>
                </div>
              );
            })}
            {resumen.byCategory.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Sin datos de categorías.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Actividad reciente</div>
            <div className="card-sub">Últimos movimientos registrados</div>
          </div>
        </div>
        <ul className="tx-list">
          {resumen.recent.map((item) => (
            <li key={item.id} className="tx-item">
              <div className={`tx-ico ${item.monto < 0 ? "tx-ico-out" : ""}`}>
                {item.monto >= 0 ? "↓" : "↑"}
              </div>
              <div className="tx-info">
                <div className="tx-name">{item.nombreComercio}</div>
                <div className="tx-cat">{item.categoria} · {formatDateTime(item.fecha)}</div>
              </div>
              <div className={`tx-amt ${item.monto >= 0 ? "tx-amt-in" : "tx-amt-out"}`}>
                {item.monto >= 0 ? "+" : ""}{formatCurrencyClp(item.monto)}
              </div>
            </li>
          ))}
          {resumen.recent.length === 0 && (
            <li style={{ padding: "12px 0", fontSize: 13, color: "var(--ink-3)" }}>Sin actividad reciente.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
