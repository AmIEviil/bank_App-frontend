import type { ResumeData } from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { formatDateTime } from "../../../utils/dateUtils";

interface ResumenViewProps {
  resumen: ResumeData;
  sourceMax: number;
}

export const ResumenView = ({ resumen, sourceMax }: ResumenViewProps) => {
  return (
    <section className="grid-2 animated-rise">
      <article className="panel">
        <h2>Resumen por fuente</h2>
        <div className="bars">
          {resumen.bySource.map((item) => (
            <div className="bar-row" key={item.label}>
              <div className="bar-label">
                <span>{item.label}</span>
                <strong>{formatCurrencyClp(item.amount)}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill accent"
                  style={{ width: `${Math.max((item.amount / sourceMax) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))}
          {resumen.bySource.length === 0 ? (
            <p className="subtitle">Aun no hay fuentes vinculadas con movimientos.</p>
          ) : null}
        </div>
      </article>
      <article className="panel">
        <h3>Ultimos movimientos</h3>
        <ul className="activity-list">
          {resumen.recent.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.nombreComercio}</strong>
                <span>{formatDateTime(item.fecha)}</span>
              </div>
              <div>
                <span>{item.categoria}</span>
                <strong>{formatCurrencyClp(item.monto)}</strong>
              </div>
            </li>
          ))}
          {resumen.recent.length === 0 ? (
            <li className="empty-item">Sin actividad reciente.</li>
          ) : null}
        </ul>
      </article>
    </section>
  );
};
