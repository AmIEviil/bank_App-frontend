import { useMemo, useState } from "react";
import { CustomTooltip } from "../../ui/custom-tooltip";
import type {
  CreditCardOverviewData,
  CreditCardScope,
  TransactionItem,
} from "../../../service/loginService";
import { formatCurrencyByCode } from "../../../utils/currencyUtils";
import { formatDateTime } from "../../../utils/dateUtils";
import { useModalStore } from "../../../store/appStore";
import { useFinanceAppController } from "../../../hooks/useFinanceAppController";
import { ProyeccionPanel } from "./proyeccion/ProyeccionPanel";

interface TarjetaCreditoViewProps {
  overview: CreditCardOverviewData;
  transactions: TransactionItem[];
}

interface ActiveInstallmentPurchase {
  key: string;
  transactionId: number;
  descripcion: string;
  comentario: string;
  currency: "CLP" | "USD";
  cuotaActual: number;
  cuotaTotal: number;
  montoCuota: number;
  montoTotalEstimado: number;
  restantes: number;
  fecha: string;
  isFacturado: boolean;
}

const scopeLabel: Record<CreditCardScope, string> = {
  nacional: "Nacional",
  internacional: "Internacional",
};

const formatMonthLabel = (monthKey: string): string => {
  const parsed = new Date(`${monthKey}-01T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return monthKey;
  return new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" }).format(parsed);
};

const parseAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return Math.abs(value);
  if (typeof value === "string") {
    const numeric = Number(value.replaceAll(/[^0-9,.-]/g, "").replaceAll(".", "").replaceAll(",", "."));
    if (Number.isFinite(numeric)) return Math.abs(numeric);
  }
  return 0;
};

const resolveInstallmentInfo = (transaction: TransactionItem): { current: number; total: number } => {
  const rawData = transaction.rawData || {};
  const current = Number(rawData.cuotaNumero || 0);
  const total = Number(rawData.cuotaTotal || 0);
  if (current > 0 && total > 0) return { current, total };
  const cuotasText = typeof rawData.cuotas === "string" ? rawData.cuotas.trim() : "";
  const match = /^(\d{1,3})\s*\/\s*(\d{1,3})$/.exec(cuotasText);
  if (!match) return { current: 0, total: 0 };
  return { current: Number(match[1]), total: Number(match[2]) };
};

const resolveCurrencyForTransaction = (transaction: TransactionItem): "CLP" | "USD" => {
  const rawData = transaction.rawData || {};
  let rawCurrency = "";
  if (typeof rawData.cargoCurrency === "string") rawCurrency = rawData.cargoCurrency.toUpperCase();
  else if (typeof rawData.currency === "string") rawCurrency = rawData.currency.toUpperCase();
  if (rawCurrency === "USD") return "USD";
  if (rawCurrency === "CLP") return "CLP";
  return rawData.scope === "internacional" ? "USD" : "CLP";
};

const resolveStatementType = (transaction: TransactionItem): string => {
  const statementType = transaction.rawData?.statementType;
  return typeof statementType === "string" ? statementType.toLowerCase() : "";
};

const resolveInstallmentValue = (transaction: TransactionItem): number => {
  const rawData = transaction.rawData || {};
  const statementType = resolveStatementType(transaction);
  const installments = resolveInstallmentInfo(transaction);
  if (statementType === "no_facturados" && installments.total > 0) {
    const totalPurchase = parseAmount(rawData.montoCargo ?? rawData.cargo);
    return totalPurchase / installments.total;
  }
  if (statementType === "facturados" && installments.current === 0) {
    const cuotaValue = parseAmount(rawData.montoCargo ?? rawData.cargo);
    if (cuotaValue > 0) return cuotaValue;
  }
  const valorCuota = parseAmount(rawData.valorCuota);
  if (valorCuota > 0) return valorCuota;
  return parseAmount(rawData.montoCargo ?? rawData.cargo) || parseAmount(transaction.monto);
};

const resolveTotalEstimatedAmount = (transaction: TransactionItem): number => {
  const rawData = transaction.rawData || {};
  const statementType = resolveStatementType(transaction);
  const installments = resolveInstallmentInfo(transaction);
  if (statementType === "facturados" && installments.current === 0) {
    const cuotaVal = resolveInstallmentValue(transaction);
    return cuotaVal * installments.total;
  }
  if (statementType === "no_facturados") {
    const totalPurchase = parseAmount(rawData.montoCargo ?? rawData.cargo);
    if (totalPurchase > 0) return totalPurchase;
  }
  const explicitTotal = parseAmount(rawData.montoTotal);
  if (explicitTotal > 0) return explicitTotal;
  const val = resolveInstallmentValue(transaction);
  return val * installments.total;
};

const resolveIsPayment = (transaction: TransactionItem): boolean => {
  const rawData = transaction.rawData || {};
  if (rawData.isPayment === true || rawData.movementKind === "payment") return true;
  const movementType = typeof rawData.tipoMovimiento === "string" ? rawData.tipoMovimiento.toLowerCase() : "";
  const description = transaction.nombreComercio.toLowerCase();
  return movementType.includes("pago") || description.startsWith("pago ");
};

const isInstallmentCandidate = (transaction: TransactionItem): boolean => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  if (sourceType !== "BANCO_CHILE_TC") return false;
  if (transaction.tipoOperacion !== "GASTO") return false;
  return !resolveIsPayment(transaction);
};

const shouldReplaceGroupedRow = (currentRow: ActiveInstallmentPurchase, nextRow: ActiveInstallmentPurchase): boolean => {
  if (nextRow.cuotaActual > currentRow.cuotaActual) return true;
  if (nextRow.cuotaActual < currentRow.cuotaActual) return false;
  return new Date(nextRow.fecha).getTime() > new Date(currentRow.fecha).getTime();
};

const buildActiveInstallments = (transactions: TransactionItem[]): ActiveInstallmentPurchase[] => {
  const grouped = new Map<string, ActiveInstallmentPurchase>();
  for (const transaction of transactions) {
    if (!isInstallmentCandidate(transaction)) continue;
    const installments = resolveInstallmentInfo(transaction);
    if (installments.total <= 1 || installments.current <= 0) continue;
    const currency = resolveCurrencyForTransaction(transaction);
    const montoTotalEstimado = resolveTotalEstimatedAmount(transaction);
    if (montoTotalEstimado <= 0) continue;
    const cuotaActual = Math.min(installments.current, installments.total);
    const cuotaTotal = installments.total;
    const montoCuota = resolveInstallmentValue(transaction);
    const restantes = Math.max(cuotaTotal - cuotaActual, 0);
    const key = `${transaction.nombreComercio}|${cuotaTotal}|${currency}|${Math.round(montoTotalEstimado)}`;
    const nextRow: ActiveInstallmentPurchase = {
      key, transactionId: transaction.id, descripcion: transaction.nombreComercio,
      comentario: transaction.comentarios || "", currency, cuotaActual, cuotaTotal,
      montoCuota, montoTotalEstimado, restantes, fecha: transaction.fecha,
      isFacturado: resolveStatementType(transaction) === "facturados",
    };
    const currentRow = grouped.get(key);
    if (!currentRow || shouldReplaceGroupedRow(currentRow, nextRow)) grouped.set(key, nextRow);
  }
  return Array.from(grouped.values()).sort((a, b) => b.restantes !== a.restantes ? b.restantes - a.restantes : a.descripcion.localeCompare(b.descripcion));
};

const CommentModalContent = ({
  initialComment, onSave, onCancel, loading,
}: { initialComment: string; onSave: (comment: string) => void; onCancel: () => void; loading: boolean; }) => {
  const [text, setText] = useState(initialComment);
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Nota o recordatorio
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ej: Regalo de cumple, supermercado mensual..."
          style={{
            minHeight: 120, background: "var(--bg-2)", color: "var(--ink-0)",
            border: "1px solid var(--line-strong)", borderRadius: 10, padding: "0.8rem",
            fontFamily: "inherit", fontSize: "0.95rem", outline: "none", resize: "vertical", width: "100%",
          }}
        />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancelar</button>
        <button className="btn-primary" onClick={() => onSave(text)} disabled={loading}>
          {loading ? "Guardando..." : "Guardar comentario"}
        </button>
      </div>
    </div>
  );
};

export const TarjetaCreditoView = ({ overview, transactions }: TarjetaCreditoViewProps) => {
  const controller = useFinanceAppController();
  const setOpenModal = useModalStore((state) => state.openModal);
  const handleCloseModal = useModalStore((state) => state.closeModal);

  const activeInstallments = useMemo(() => buildActiveInstallments(transactions), [transactions]);

  const handleComentarioClick = (purchase: ActiveInstallmentPurchase) => {
    setOpenModal({
      header: `${purchase.comentario ? "Editar" : "Asignar"} comentario`,
      content: (
        <CommentModalContent
          initialComment={purchase.comentario}
          loading={controller.updateCommentLoading}
          onCancel={handleCloseModal}
          onSave={(newComment) => { controller.updateComment(purchase.transactionId, newComment); handleCloseModal(); }}
        />
      ),
    });
  };

  const nationalSummary = overview.summaries.find(s => s.scope === "nacional") ?? overview.summaries[0];

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      {/* CC Visual Card + Summary Row */}
      <div className="grid-2-col">
        {/* Visual CC Card */}
        <div className="cc-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div className="cc-chip" />
            <div className="cc-network-circles">
              <span />
              <span />
            </div>
          </div>
          <div className="cc-num">•••• •••• •••• ····</div>
          <div className="cc-meta">
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>TITULAR</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Banco de Chile</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>CICLO</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{formatMonthLabel(overview.currentMonth || "-")}</div>
            </div>
          </div>
          {nationalSummary && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>UTILIZACIÓN</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                  {formatCurrencyByCode(nationalSummary.billedCurrentMonth, nationalSummary.currency)}
                </span>
              </div>
              <div className="util-bar">
                <div className="util-fill" style={{ width: `${Math.min((nationalSummary.billedCurrentMonth / (nationalSummary.billedCurrentMonth * 2 || 1)) * 100, 75)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Summaries */}
        <div style={{ display: "grid", gap: "var(--gap)" }}>
          {overview.summaries.length === 0 ? (
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
              <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Sin movimientos de tarjeta de crédito.</p>
            </div>
          ) : (
            overview.summaries.map((item) => (
              <div className="card" key={`${item.scope}-${item.currency}`}>
                <div className="card-head">
                  <div>
                    <div className="card-title">{scopeLabel[item.scope]} · {item.currency}</div>
                    <div className="card-sub">
                      {item.billingDate ? `${item.billingDate} → ${item.payUntil || "-"}` : "Ciclo pendiente"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 4 }}>A PAGAR</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--loss)" }}>
                      {formatCurrencyByCode(item.billedCurrentMonth, item.currency)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 4 }}>PAGO MÍNIMO</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink-1)" }}>
                      {formatCurrencyByCode(item.minimumPayment, item.currency)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proyección de facturación (crawler + cargos programados) */}
      <ProyeccionPanel />

      {/* Active Installments Table */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Compras en cuotas activas</div>
            <div className="card-sub">Estado actual de cada compra — {activeInstallments.length} activas</div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Compra</th>
                <th>Comentario</th>
                <th>Monto cuota</th>
                <th>Cuota actual</th>
                <th>Total cuotas</th>
                <th>Restantes</th>
                <th>Total estimado</th>
              </tr>
            </thead>
            <tbody>
              {activeInstallments.map((item) => (
                <tr key={item.key}>
                  <td>
                    <CustomTooltip
                      classname={{ position: "top" }}
                      content={
                        item.cuotaActual === 0
                          ? "Compra con periodo de gracia. El primer cobro se verá reflejado el próximo mes."
                          : item.isFacturado
                            ? "Esta compra ya está siendo facturada en tu estado de cuenta actual."
                            : "Movimiento detectado en 'No Facturados'. La primera cuota aparecerá pronto."
                      }
                    >
                      <span className="installment-description">{item.descripcion}</span>
                    </CustomTooltip>
                  </td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => handleComentarioClick(item)}
                      style={{
                        padding: 0, background: "none", border: "none",
                        color: item.comentario ? "var(--ink-0)" : "var(--ink-3)",
                        textDecoration: item.comentario ? "none" : "underline",
                        cursor: "pointer", fontSize: "0.85rem", textAlign: "left", width: "100%",
                      }}
                    >
                      {item.comentario || "Asignar nota"}
                    </button>
                  </td>
                  <td style={{ fontFamily: "var(--mono)" }}>{formatCurrencyByCode(item.montoCuota, item.currency)}</td>
                  <td style={{ fontFamily: "var(--mono)", textAlign: "center" }}>{item.cuotaActual}</td>
                  <td style={{ fontFamily: "var(--mono)", textAlign: "center" }}>{item.cuotaTotal}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="inst-progress-track">
                        <div
                          className="inst-progress-fill"
                          style={{ width: `${Math.round((item.cuotaActual / item.cuotaTotal) * 100)}%` }}
                        />
                      </div>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-2)" }}>{item.restantes}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--mono)" }}>{formatCurrencyByCode(item.montoTotalEstimado, item.currency)}</td>
                </tr>
              ))}
              {activeInstallments.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">No hay compras en cuotas activas para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Pagos recientes</div>
            <div className="card-sub">{overview.recentPayments.length} pagos registrados</div>
          </div>
        </div>
        <ul className="tx-list">
          {overview.recentPayments.map((payment) => (
            <li key={payment.id} className="tx-item">
              <div className="tx-ico">↑</div>
              <div className="tx-info">
                <div className="tx-name">{payment.descripcion}</div>
                <div className="tx-cat">{scopeLabel[payment.scope]} · {payment.currency} · {formatDateTime(payment.fecha)}</div>
              </div>
              <div className="tx-amt tx-amt-in">{formatCurrencyByCode(payment.montoPago, payment.currency)}</div>
            </li>
          ))}
          {overview.recentPayments.length === 0 && (
            <li style={{ padding: "12px 0", fontSize: 13, color: "var(--ink-3)" }}>No hay pagos recientes.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
