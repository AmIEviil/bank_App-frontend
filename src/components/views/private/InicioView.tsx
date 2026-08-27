import { formatCurrencyClp } from "../../../utils/currencyUtils";
import type {
  MetricsData,
  CreditCardOverviewData,
  ProjectionMonth,
} from "../../../service/loginService";
import { Sparkline } from "../../charts/Sparkline";

interface InicioViewProps {
  userName: string;
  metrics: MetricsData;
  creditCardOverview: CreditCardOverviewData;
  /** Proyección unificada (cuotas del banco + cargos programados). */
  projectionMonths: ProjectionMonth[];
  onGoMovimientos: () => void;
  onGoMetricas: () => void;
}

const formatMonthLabel = (monthKey: string): string => {
  const parsed = new Date(`${monthKey}-01T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return monthKey;
  return new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" }).format(parsed);
};

export const InicioView = ({
  userName,
  metrics,
  creditCardOverview,
  projectionMonths,
  onGoMovimientos,
  onGoMetricas,
}: InicioViewProps) => {
  const netCashFlow = metrics.totalIngresos - metrics.totalGastos;
  const savingsRate = metrics.totalIngresos > 0
    ? Math.round((netCashFlow / metrics.totalIngresos) * 100)
    : 0;

  const nextBill = creditCardOverview.summaries[0] ?? null;

  // Decorative sparkline data derived from balance/gastos
  const sparkData = [
    metrics.balance * 0.7,
    metrics.balance * 0.75,
    metrics.balance * 0.72,
    metrics.balance * 0.8,
    metrics.balance * 0.85,
    metrics.balance * 0.78,
    metrics.balance * 0.9,
    metrics.balance * 0.88,
    metrics.balance * 0.95,
    metrics.balance,
  ];

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      {/* Hero Card */}
      <div className="hero-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>
              Patrimonio neto · {userName ? `Hola, ${userName}` : "Dashboard"}
            </div>
            <div className="hero-balance">{formatCurrencyClp(metrics.balance)}</div>
            <div className="hero-stamps">
              <div>
                <span className="hero-stamps-label">Ingresos</span>
                <span className="hero-stamps-val tag tag-gain">{formatCurrencyClp(metrics.totalIngresos)}</span>
              </div>
              <div>
                <span className="hero-stamps-label">Gastos</span>
                <span className="hero-stamps-val tag tag-loss">{formatCurrencyClp(metrics.totalGastos)}</span>
              </div>
              {nextBill && (
                <div>
                  <span className="hero-stamps-label">TC a pagar</span>
                  <span className="hero-stamps-val tag tag-warn">{formatCurrencyClp(nextBill.billedCurrentMonth)}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ marginLeft: 16, opacity: 0.7, flexShrink: 0 }}>
            <Sparkline data={sparkData} w={180} h={64} color="var(--accent)" />
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid-4-col">
        <div className="kpi">
          <div className="kpi-label">Ingresos</div>
          <div className="kpi-value">{formatCurrencyClp(metrics.totalIngresos)}</div>
          <div className="kpi-sub tag tag-gain">este mes</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Gastos</div>
          <div className="kpi-value">{formatCurrencyClp(metrics.totalGastos)}</div>
          <div className="kpi-sub tag tag-loss">este mes</div>
        </div>
        <div className={`kpi ${savingsRate >= 0 ? "kpi-accent" : ""}`}>
          <div className="kpi-label">Tasa de ahorro</div>
          <div className="kpi-value">{savingsRate}%</div>
          <div className={`kpi-sub tag ${savingsRate >= 20 ? "tag-gain" : savingsRate >= 0 ? "tag-warn" : "tag-loss"}`}>
            {savingsRate >= 20 ? "Excelente" : savingsRate >= 0 ? "Moderado" : "Déficit"}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Movimientos</div>
          <div className="kpi-value">{metrics.cantidadMovimientos}</div>
          <div className="kpi-sub tag">operaciones</div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid-2-col">
        {/* Próximas obligaciones */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Próximas obligaciones</div>
              <div className="card-sub">Tarjeta de crédito</div>
            </div>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onGoMovimientos}>Ver todo</button>
          </div>

          {nextBill ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-0)" }}>
                    {nextBill.scope === "internacional" ? "Internacional" : "Nacional"} · {nextBill.currency}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                    {nextBill.billingDate ? `Vence: ${nextBill.billingDate}` : "Pendiente"}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--loss)", textAlign: "right" }}>
                    {formatCurrencyClp(nextBill.billedCurrentMonth)}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textAlign: "right" }}>
                    mín. {formatCurrencyClp(nextBill.minimumPayment)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-3)", padding: "12px 0" }}>Sin obligaciones detectadas.</p>
          )}

          {projectionMonths.map((proj) => (
            <div key={proj.month} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-2)" }}>
                {formatMonthLabel(proj.month)}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-1)" }}>
                {formatCurrencyClp(proj.totalCLPConvertido)}
              </div>
            </div>
          ))}
        </div>

        {/* Flujo del mes */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Flujo del mes</div>
              <div className="card-sub">Neto acumulado</div>
            </div>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onGoMetricas}>Métricas</button>
          </div>

          <div style={{ display: "grid", gap: 12, paddingTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Flujo neto</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: netCashFlow >= 0 ? "var(--gain)" : "var(--loss)" }}>
                {netCashFlow >= 0 ? "+" : ""}{formatCurrencyClp(netCashFlow)}
              </span>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>
                <span>GASTOS / INGRESOS</span>
                <span>{metrics.totalIngresos > 0 ? Math.round((metrics.totalGastos / metrics.totalIngresos) * 100) : 0}%</span>
              </div>
              <div className="util-bar">
                <div
                  className="util-fill"
                  style={{
                    width: `${Math.min(metrics.totalIngresos > 0 ? (metrics.totalGastos / metrics.totalIngresos) * 100 : 0, 100)}%`,
                    background: savingsRate < 0 ? "var(--loss)" : savingsRate < 20 ? "var(--warn)" : "var(--gain)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 2 }}>Ticket promedio</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-0)" }}>{formatCurrencyClp(metrics.ticketPromedio)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 2 }}>Gasto diario est.</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-0)" }}>{formatCurrencyClp(metrics.totalGastos / 30)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
