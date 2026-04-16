import type {
  CreditCardOverviewData,
  CreditCardScope,
} from "../../../service/loginService";
import { formatCurrencyByCode } from "../../../utils/currencyUtils";
import { formatDateTime } from "../../../utils/dateUtils";

interface TarjetaCreditoViewProps {
  overview: CreditCardOverviewData;
}

const scopeLabel: Record<CreditCardScope, string> = {
  nacional: "Nacional",
  internacional: "Internacional",
};

const formatMonthLabel = (monthKey: string): string => {
  const parsed = new Date(`${monthKey}-01T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return monthKey;
  }

  return new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  }).format(parsed);
};

export const TarjetaCreditoView = ({ overview }: TarjetaCreditoViewProps) => {
  const projectionMax =
    overview.projections.length > 0
      ? Math.max(...overview.projections.map((item) => item.projectedCharge))
      : 1;

  return (
    <section className="grid-2 animated-rise">
      <article className="panel">
        <div className="section-head">
          <h2>Resumen tarjeta de credito</h2>
          <p className="subtitle">
            Mes analizado: {formatMonthLabel(overview.currentMonth || "-")}
          </p>
        </div>

        {overview.summaries.length === 0 ? (
          <p className="subtitle">Aun no hay movimientos de tarjeta de credito.</p>
        ) : (
          <div className="kpi-list">
            {overview.summaries.map((item) => (
              <div className="panel" key={`${item.scope}-${item.currency}`}>
                <div className="section-head">
                  <h3>{`${scopeLabel[item.scope]} (${item.currency})`}</h3>
                  <p className="subtitle">
                    Facturado: {item.billingDate || "-"} | Pagar hasta: {item.payUntil || "-"}
                  </p>
                </div>
                <div className="kpi-cards">
                  <div className="kpi-card">
                    <span>Facturado mes</span>
                    <strong>{formatCurrencyByCode(item.billedCurrentMonth, item.currency)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Pagos mes</span>
                    <strong>{formatCurrencyByCode(item.paymentsCurrentMonth, item.currency)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Pendiente no facturado</span>
                    <strong>{formatCurrencyByCode(item.pendingNoFacturado, item.currency)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Pago minimo</span>
                    <strong>{formatCurrencyByCode(item.minimumPayment, item.currency)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="panel">
        <div className="section-head">
          <h2>Proyeccion de cuotas</h2>
          <p className="subtitle">Cargos estimados para los proximos meses.</p>
        </div>

        <div className="bars">
          {overview.projections.map((item) => (
            <div className="bar-row" key={`${item.month}-${item.scope}-${item.currency}`}>
              <div className="bar-label">
                <span>{`${formatMonthLabel(item.month)} - ${scopeLabel[item.scope]} (${item.currency})`}</span>
                <strong>{formatCurrencyByCode(item.projectedCharge, item.currency)}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.max((item.projectedCharge / projectionMax) * 100, 8)}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {overview.projections.length === 0 ? (
            <p className="subtitle">Sin proyeccion de cuotas pendiente.</p>
          ) : null}
        </div>

        <h3 style={{ marginTop: "1rem" }}>Pagos recientes</h3>
        <ul className="activity-list">
          {overview.recentPayments.map((payment) => (
            <li key={payment.id}>
              <div>
                <strong>{payment.descripcion}</strong>
                <span>{formatDateTime(payment.fecha)}</span>
              </div>
              <div>
                <span>{`${scopeLabel[payment.scope]} | ${payment.currency}`}</span>
                <strong>{formatCurrencyByCode(payment.montoPago, payment.currency)}</strong>
              </div>
            </li>
          ))}
          {overview.recentPayments.length === 0 ? (
            <li className="empty-item">No hay pagos recientes.</li>
          ) : null}
        </ul>
      </article>
    </section>
  );
};
