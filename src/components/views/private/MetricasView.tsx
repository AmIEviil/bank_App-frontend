import type { MetricsData, ResumeData } from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { DonutChart, SERIES_COLORS } from "../../charts/DonutChart";
import { useTooltip, TipPortal, TipBody } from "../../ui/Tooltip";

interface MetricasViewProps {
  metrics: MetricsData;
  resumen: ResumeData;
  categoryMax: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export const MetricasView = ({ 
  metrics, 
  resumen, 
  categoryMax, 
  selectedMonth, 
  onMonthChange 
}: MetricasViewProps) => {
  const tooltip = useTooltip();
  const savings = metrics.totalIngresos - metrics.totalGastos;
  const savingsRate = metrics.totalIngresos > 0 ? Math.round((savings / metrics.totalIngresos) * 100) : 0;

  const donutData = resumen.byCategory.slice(0, 10).map((item, idx) => ({
    label: item.label,
    amount: item.amount,
    color: SERIES_COLORS[idx % SERIES_COLORS.length],
  }));

  const efficiencyMetrics = [
    { 
      label: "Ticket promedio", 
      value: formatCurrencyClp(metrics.ticketPromedio),
      description: "Promedio de gasto por transacción.",
      calculation: "Gasto total / Cantidad de movimientos"
    },
    { 
      label: "Gasto diario est.", 
      value: formatCurrencyClp(metrics.totalGastos / 30),
      description: "Ritmo de gasto diario promedio proyectado a 30 días.",
      calculation: "Gasto total / 30"
    },
    { 
      label: "Volumen ops.", 
      value: `${metrics.cantidadMovimientos} ops`,
      description: "Cantidad total de transacciones realizadas en el periodo.",
      calculation: "Suma de todos los movimientos"
    },
    { 
      label: "Gasto mensual libre", 
      value: formatCurrencyClp(Math.max(0, savings)),
      description: "Excedente de ingresos sobre gastos. Capital neto disponible.",
      calculation: "Ingresos totales - Gastos totales"
    },
  ];

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      <TipPortal state={tooltip.state} />
      
      {/* Month Selector & Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-0)", margin: 0 }}>Análisis de Métricas</h2>
          <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "4px 0 0 0" }}>Visualización detallada de tu comportamiento financiero</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--ink-2)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Periodo:</span>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="text-input"
            style={{ padding: "6px 12px", fontSize: 13, width: "auto" }}
          />
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid-4-col">
        <div 
          className={`kpi ${savingsRate >= 0 ? "kpi-accent" : ""}`}
          onMouseEnter={(e) => tooltip.show(
            <TipBody 
              title="Tasa de ahorro" 
              eyebrow="Ratio de eficiencia"
              value={`${savingsRate}%`}
              rows={[
                { l: "Ingresos", v: formatCurrencyClp(metrics.totalIngresos) },
                { l: "Gastos", v: formatCurrencyClp(metrics.totalGastos) },
                { l: "Ahorro", v: formatCurrencyClp(savings), sign: savings >= 0 ? "pos" : "neg" }
              ]}
              foot="Porcentaje del ingreso que no se consume."
            />, e
          )}
          onMouseMove={tooltip.move}
          onMouseLeave={tooltip.hide}
          style={{ cursor: "help" }}
        >
          <div className="kpi-label">Tasa de ahorro</div>
          <div className="kpi-value">{savingsRate}%</div>
          <div className={`kpi-sub tag ${savingsRate >= 20 ? "tag-gain" : savingsRate >= 0 ? "tag-warn" : "tag-loss"}`}>
            {savingsRate >= 20 ? "Excelente" : savingsRate >= 0 ? "Moderado" : "Déficit"}
          </div>
        </div>
        
        <div className="kpi">
          <div className="kpi-label">Ingresos totales</div>
          <div className="kpi-value">{formatCurrencyClp(metrics.totalIngresos)}</div>
          <div className="kpi-sub tag tag-gain">periodo seleccionado</div>
        </div>
        
        <div className="kpi">
          <div className="kpi-label">Gastos totales</div>
          <div className="kpi-value">{formatCurrencyClp(metrics.totalGastos)}</div>
          <div className="kpi-sub tag tag-loss">periodo seleccionado</div>
        </div>
        
        <div 
          className="kpi"
          onMouseEnter={(e) => tooltip.show(
            <TipBody 
              title="Capital Neto" 
              eyebrow="Balance Final"
              value={formatCurrencyClp(savings)}
              foot="Saldo final acumulado en el periodo."
            />, e
          )}
          onMouseMove={tooltip.move}
          onMouseLeave={tooltip.hide}
          style={{ cursor: "help" }}
        >
          <div className="kpi-label">Capital neto</div>
          <div className="kpi-value">{formatCurrencyClp(savings)}</div>
          <div className={`kpi-sub tag ${savings >= 0 ? "tag-gain" : "tag-loss"}`}>
            {savings >= 0 ? "positivo" : "negativo"}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2-col">
        {/* Donut + Legend */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Composición del gasto</div>
              <div className="card-sub">Top {donutData.length} categorías de consumo</div>
            </div>
          </div>
          {donutData.length > 0 ? (
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", padding: "12px 0" }}>
              <div style={{ flexShrink: 0 }}>
                <DonutChart data={donutData} size={180} total={metrics.totalGastos} />
              </div>
              <div className="donut-legend" style={{ flex: 1, minWidth: 200 }}>
                {donutData.map((item, idx) => (
                  <div 
                    className="donut-row" 
                    key={item.label}
                    style={{ 
                      padding: "6px 0", 
                      borderBottom: idx === donutData.length - 1 ? "none" : "1px solid var(--line)" 
                    }}
                    onMouseEnter={(e) => tooltip.show(
                      <TipBody 
                        title={item.label} 
                        value={formatCurrencyClp(item.amount)}
                        footRight={`${Math.round((item.amount / metrics.totalGastos) * 100)}% del gasto`}
                      />, e
                    )}
                    onMouseMove={tooltip.move}
                    onMouseLeave={tooltip.hide}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-0)", whiteSpace: "nowrap", fontWeight: 500 }}>
                      {formatCurrencyClp(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-3)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>∅</div>
              <p style={{ fontSize: 13 }}>Sin datos de categorías para este periodo.</p>
            </div>
          )}
        </div>

        {/* Efficiency metrics */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Eficiencia operativa</div>
              <div className="card-sub">Ratios y análisis de consumo</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 4, paddingTop: 4 }}>
            {efficiencyMetrics.map((row) => (
              <div 
                key={row.label} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "12px 0", 
                  borderBottom: "1px solid var(--line)",
                  cursor: "help"
                }}
                onMouseEnter={(e) => tooltip.show(
                  <TipBody 
                    title={row.label} 
                    eyebrow="Métrica de Eficiencia"
                    value={row.value}
                    foot={row.description}
                    footRight={row.calculation}
                    accent
                  />, e
                )}
                onMouseMove={tooltip.move}
                onMouseLeave={tooltip.hide}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{row.label}</span>
                  <span style={{ fontSize: 10, color: "var(--ink-3)", opacity: 0.6 }}>ⓘ</span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-0)", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: "var(--bg-1)", borderRadius: 8, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Resumen de actividad</div>
            <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.4 }}>
              Has realizado <span style={{ color: "var(--ink-0)", fontWeight: 600 }}>{metrics.cantidadMovimientos}</span> operaciones este periodo, 
              con un balance neto de <span style={{ color: savings >= 0 ? "var(--gain)" : "var(--loss)", fontWeight: 600 }}>{formatCurrencyClp(savings)}</span>.
            </div>
          </div>
        </div>
      </div>

      {/* Category Bars */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Desglose por categoría</div>
            <div className="card-sub">{resumen.byCategory.length} categorías detectadas</div>
          </div>
        </div>
        <div className="bars-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px 32px" }}>
          {resumen.byCategory.map((item, idx) => {
            const pct = categoryMax > 0 ? (item.amount / categoryMax) * 100 : 0;
            const ofTotal = metrics.totalGastos > 0 ? Math.round((item.amount / metrics.totalGastos) * 100) : 0;
            const color = SERIES_COLORS[idx % SERIES_COLORS.length];
            return (
              <div 
                key={item.label} 
                style={{ display: "grid", gap: 6 }}
                onMouseEnter={(e) => tooltip.show(
                  <TipBody 
                    title={item.label} 
                    value={formatCurrencyClp(item.amount)}
                    rows={[
                      { l: "% del total", v: `${ofTotal}%` },
                      { l: "Max categoría", v: formatCurrencyClp(categoryMax) }
                    ]}
                  />, e
                )}
                onMouseMove={tooltip.move}
                onMouseLeave={tooltip.hide}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="tag" style={{ fontFamily: "var(--mono)", fontSize: 10, background: "var(--bg-1)" }}>{ofTotal}%</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-0)", fontWeight: 500 }}>{formatCurrencyClp(item.amount)}</span>
                  </div>
                </div>
                <div className="bar-track" style={{ height: 6 }}>
                  <div className="bar-fill" style={{ width: `${Math.max(pct, 1.5)}%`, minWidth: 4, background: color, height: "100%" }} />
                </div>
              </div>
            );
          })}
          {resumen.byCategory.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--ink-3)", gridColumn: "1 / -1" }}>Sin datos de categorías.</p>
          )}
        </div>
      </div>
    </div>
  );
};
