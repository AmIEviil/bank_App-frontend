import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { Button } from "../../ui/Button";
import type { MetricsData } from "../../../service/loginService";

interface InicioViewProps {
  userName: string;
  metrics: MetricsData;
  onGoMovimientos: () => void;
  onGoMetricas: () => void;
}

export const InicioView = ({
  userName,
  metrics,
  onGoMovimientos,
  onGoMetricas,
}: InicioViewProps) => {
  return (
    <section className="grid-2 animated-rise">
      <article className="panel hero-card">
        <h2>Hola, {userName || "Usuario"}</h2>
        <p className="subtitle">
          Esta es tu vista central con trazabilidad de ingresos y gastos.
        </p>
        <div className="hero-metrics">
          <div>
            <span>Balance actual</span>
            <strong>{formatCurrencyClp(metrics.balance)}</strong>
          </div>
          <div>
            <span>Movimientos</span>
            <strong>{metrics.cantidadMovimientos}</strong>
          </div>
        </div>
        <div className="inline-actions">
          <Button variant="secondary" onClick={onGoMovimientos}>
            Ver movimientos
          </Button>
          <Button variant="secondary" onClick={onGoMetricas}>
            Explorar metricas
          </Button>
        </div>
      </article>
      <article className="panel">
        <h3>Radar rapido</h3>
        <ul className="kpi-list">
          <li>
            <span>Ingresos</span>
            <strong>{formatCurrencyClp(metrics.totalIngresos)}</strong>
          </li>
          <li>
            <span>Gastos</span>
            <strong>{formatCurrencyClp(metrics.totalGastos)}</strong>
          </li>
          <li>
            <span>Ticket promedio</span>
            <strong>{formatCurrencyClp(metrics.ticketPromedio)}</strong>
          </li>
          <li>
            <span>Gasto mensual promedio</span>
            <strong>{formatCurrencyClp(metrics.gastoMensualPromedio)}</strong>
          </li>
        </ul>
      </article>
    </section>
  );
};
