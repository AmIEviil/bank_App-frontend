import type { MetricsData, ResumeData } from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";

interface MetricasViewProps {
  metrics: MetricsData;
  resumen: ResumeData;
  categoryMax: number;
}

export const MetricasView = ({ metrics, resumen, categoryMax }: MetricasViewProps) => {
  return (
    <section className="grid-2 animated-rise">
      <article className="panel">
        <h2>Metricas financieras</h2>
        <div className="kpi-cards">
          <div className="kpi-card">
            <span>Balance</span>
            <strong>{formatCurrencyClp(metrics.balance)}</strong>
          </div>
          <div className="kpi-card">
            <span>Ingresos</span>
            <strong>{formatCurrencyClp(metrics.totalIngresos)}</strong>
          </div>
          <div className="kpi-card">
            <span>Gastos</span>
            <strong>{formatCurrencyClp(metrics.totalGastos)}</strong>
          </div>
          <div className="kpi-card">
            <span>Movimientos</span>
            <strong>{metrics.cantidadMovimientos}</strong>
          </div>
        </div>
      </article>
      <article className="panel">
        <h3>Gasto por categoria</h3>
        <div className="bars">
          {resumen.byCategory.map((item) => (
            <div className="bar-row" key={item.label}>
              <div className="bar-label">
                <span>{item.label}</span>
                <strong>{formatCurrencyClp(item.amount)}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${Math.max((item.amount / categoryMax) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))}
          {resumen.byCategory.length === 0 ? (
            <p className="subtitle">Aun no hay datos de categorias para mostrar.</p>
          ) : null}
        </div>
      </article>
    </section>
  );
};
