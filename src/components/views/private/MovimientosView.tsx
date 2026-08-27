import { useMemo, useState } from "react";
import { CustomTooltip } from "../../ui/custom-tooltip";
import type { TransactionItem } from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { formatDateTime, parseDateTimeFlexible } from "../../../utils/dateUtils";
import type {
  MovementFilter,
  MovementSourceFilter,
  MovementStatementFilter,
} from "../../../types/view.types";

interface MovimientosViewProps {
  search: string;
  filter: MovementFilter;
  sourceFilter: MovementSourceFilter;
  statementFilter: MovementStatementFilter;
  transactions: TransactionItem[];
  categorizeLoading?: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: MovementFilter) => void;
  onSourceFilterChange: (value: MovementSourceFilter) => void;
  onStatementFilterChange: (value: MovementStatementFilter) => void;
  onCategorizeWithAi: (id: number) => void;
}

type MovementOrderBy = "fecha-desc" | "fecha-asc" | "monto-desc" | "monto-asc";

const getSourceLabel = (transaction: TransactionItem): string => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  return sourceType === "BANCO_CHILE_TC" ? "Tarjeta crédito" : "Cuenta corriente";
};

const getStatementLabel = (transaction: TransactionItem): string => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  if (sourceType !== "BANCO_CHILE_TC") return "-";
  const statementType = typeof transaction.rawData?.statementType === "string" ? transaction.rawData.statementType : "";
  if (statementType === "facturados") return "Facturado";
  if (statementType === "no_facturados") return "No facturado";
  return "Tarjeta";
};

const getScopeLabel = (transaction: TransactionItem): string => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  if (sourceType !== "BANCO_CHILE_TC") return "-";
  if (typeof transaction.rawData?.scope !== "string") return "Tarjeta";
  if (transaction.rawData.scope === "nacional") return "Nacional";
  if (transaction.rawData.scope === "internacional") return "Internacional";
  return transaction.rawData.scope;
};

const getTransactionDateCandidate = (transaction: TransactionItem): string => {
  const rawDateCandidates = [
    transaction.rawData?.fechaCompra,
    transaction.rawData?.fecha,
    transaction.rawData?.date,
  ];
  for (const candidate of rawDateCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) return candidate;
  }
  return transaction.fecha;
};

const getTransactionDateTimeValue = (transaction: TransactionItem): number => {
  const parsed = parseDateTimeFlexible(getTransactionDateCandidate(transaction));
  return parsed ? parsed.getTime() : 0;
};

const parseMoneyValue = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replaceAll(/[^0-9,.-]/g, "").replaceAll(".", "").replaceAll(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const getInstallmentTooltip = (transaction: TransactionItem): string | null => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  if (sourceType !== "BANCO_CHILE_TC") return null;
  const rawData = transaction.rawData;
  if (!rawData) return null;
  const cuotaNumero = Number(rawData.cuotaNumero ?? 0);
  const cuotaTotal = Number(rawData.cuotaTotal ?? 0);
  const cuotasText = typeof rawData.cuotas === "string" ? rawData.cuotas.trim() : "";
  const valorCuota = parseMoneyValue(rawData.valorCuota ?? rawData.montoCuota ?? rawData.valor_cuota);
  const hasInstallmentData = (cuotaNumero > 0 && cuotaTotal > 0) || cuotasText.length > 0 || valorCuota > 0;
  if (!hasInstallmentData) return null;
  let cuotasLabel = "Cuotas no informadas";
  if (cuotaNumero > 0 && cuotaTotal > 0) cuotasLabel = `Cuota ${cuotaNumero}/${cuotaTotal}`;
  else if (cuotasText.length > 0) cuotasLabel = `Cuota ${cuotasText}`;
  const valorLabel = valorCuota > 0 ? formatCurrencyClp(valorCuota) : formatCurrencyClp(Number(transaction.monto));
  return `${cuotasLabel} - Valor cuota ${valorLabel}`;
};

export const MovimientosView = ({
  search,
  filter,
  sourceFilter,
  statementFilter,
  transactions,
  categorizeLoading,
  onSearchChange,
  onFilterChange,
  onSourceFilterChange,
  onStatementFilterChange,
  onCategorizeWithAi,
}: MovimientosViewProps) => {
  const [orderBy, setOrderBy] = useState<MovementOrderBy>("fecha-desc");
  const [categorizingId, setCategorizingId] = useState<number | null>(null);

  const handleCategorize = (id: number) => {
    setCategorizingId(id);
    onCategorizeWithAi(id);
  };

  const sortedTransactions = useMemo(() => {
    const rows = [...transactions];
    rows.sort((left, right) => {
      if (orderBy === "monto-desc") return Number(right.monto) - Number(left.monto);
      if (orderBy === "monto-asc") return Number(left.monto) - Number(right.monto);
      const leftDate = getTransactionDateTimeValue(left);
      const rightDate = getTransactionDateTimeValue(right);
      if (orderBy === "fecha-asc") return leftDate - rightDate;
      return rightDate - leftDate;
    });
    return rows;
  }, [orderBy, transactions]);

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-0)" }}>Movimientos</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
            {sortedTransactions.length} operaciones
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-input" style={{ flex: 2 }}>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar comercio, categoría, fuente…"
          />
        </div>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as MovementFilter)}
        >
          <option value="all">Todos</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
        </select>
        <select
          className="filter-select"
          value={sourceFilter}
          onChange={(e) => onSourceFilterChange(e.target.value as MovementSourceFilter)}
        >
          <option value="all">Todas las fuentes</option>
          <option value="cuenta-corriente">Cuenta corriente</option>
          <option value="tarjeta-credito">Tarjeta de crédito</option>
        </select>
        <select
          className="filter-select"
          value={statementFilter}
          onChange={(e) => onStatementFilterChange(e.target.value as MovementStatementFilter)}
        >
          <option value="all">Todos los estados TC</option>
          <option value="facturados">Facturados</option>
          <option value="no-facturados">No facturados</option>
        </select>
        <select
          className="filter-select"
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value as MovementOrderBy)}
        >
          <option value="fecha-desc">Más reciente</option>
          <option value="fecha-asc">Más antigua</option>
          <option value="monto-desc">Mayor monto</option>
          <option value="monto-asc">Menor monto</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Comercio</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Fuente</th>
              <th className="col-tc">Estado TC</th>
              <th className="col-tc">Ámbito TC</th>
              <th className="col-tc">Cuota TC</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => {
              const installmentTooltip = getInstallmentTooltip(transaction);
              return (
                <tr key={transaction.id}>
                  <td>{formatDateTime(getTransactionDateCandidate(transaction))}</td>
                  <td>{transaction.nombreComercio}</td>
                  <td 
                    onClick={() => !categorizeLoading && handleCategorize(transaction.id)}
                    style={{ 
                      cursor: categorizeLoading ? "wait" : "pointer",
                      color: transaction.categoria?.nombre ? "inherit" : "var(--ink-3)",
                      fontStyle: transaction.categoria?.nombre ? "normal" : "italic",
                      position: "relative"
                    }}
                    title="Click para categorizar con IA"
                  >
                    {categorizeLoading && categorizingId === transaction.id ? (
                      <span style={{ fontSize: 10, opacity: 0.7 }}>Categorizando...</span>
                    ) : (
                      transaction.categoria?.nombre || "Sin categoría"
                    )}
                  </td>
                  <td>
                    <span className={`pill ${transaction.tipoOperacion === "INGRESO" ? "pill-in" : "pill-out"}`}>
                      {transaction.tipoOperacion}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--mono)" }}>{formatCurrencyClp(Number(transaction.monto))}</td>
                  <td>{getSourceLabel(transaction)}</td>
                  <td className="col-tc">{getStatementLabel(transaction)}</td>
                  <td className="col-tc">{getScopeLabel(transaction)}</td>
                  <td className="col-tc">
                    {installmentTooltip ? (
                      <CustomTooltip classname={{ position: "top" }} content={installmentTooltip}>
                        <span className="tooltip-chip">Ver cuota</span>
                      </CustomTooltip>
                    ) : "-"}
                  </td>
                </tr>
              );
            })}
            {sortedTransactions.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "24px 14px", color: "var(--ink-3)", fontSize: 13 }}>No hay movimientos para los filtros actuales.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
