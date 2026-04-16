import type { TransactionItem } from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { formatDateTime } from "../../../utils/dateUtils";
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
  onSearchChange: (value: string) => void;
  onFilterChange: (value: MovementFilter) => void;
  onSourceFilterChange: (value: MovementSourceFilter) => void;
  onStatementFilterChange: (value: MovementStatementFilter) => void;
}

const getSourceLabel = (transaction: TransactionItem): string => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  return sourceType === "BANCO_CHILE_TC" ? "Tarjeta credito" : "Cuenta corriente";
};

const getStatementLabel = (transaction: TransactionItem): string => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  if (sourceType !== "BANCO_CHILE_TC") {
    return "-";
  }

  const statementType =
    typeof transaction.rawData?.statementType === "string"
      ? transaction.rawData.statementType
      : "";

  if (statementType === "facturados") {
    return "Facturado";
  }

  if (statementType === "no_facturados") {
    return "No facturado";
  }

  return "Tarjeta";
};

const getScopeLabel = (transaction: TransactionItem): string => {
  const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
  if (sourceType !== "BANCO_CHILE_TC") {
    return "-";
  }

  if (typeof transaction.rawData?.scope !== "string") {
    return "Tarjeta";
  }

  if (transaction.rawData.scope === "nacional") {
    return "Nacional";
  }

  if (transaction.rawData.scope === "internacional") {
    return "Internacional";
  }

  return transaction.rawData.scope;
};

export const MovimientosView = ({
  search,
  filter,
  sourceFilter,
  statementFilter,
  transactions,
  onSearchChange,
  onFilterChange,
  onSourceFilterChange,
  onStatementFilterChange,
}: MovimientosViewProps) => {
  return (
    <section className="panel animated-rise">
      <div className="section-head">
        <h2>Movimientos</h2>
        <p className="subtitle">
          Filtra por tipo, fuente y estado de tarjeta para analizar mejor tus cargos.
        </p>
      </div>
      <div className="toolbar">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por comercio, categoria, fuente o estado"
        />
        <select
          value={filter}
          onChange={(event) => onFilterChange(event.target.value as MovementFilter)}
        >
          <option value="all">Todos</option>
          <option value="ingreso">Solo ingresos</option>
          <option value="gasto">Solo gastos</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(event) =>
            onSourceFilterChange(event.target.value as MovementSourceFilter)
          }
        >
          <option value="all">Todas las fuentes</option>
          <option value="cuenta-corriente">Cuenta corriente</option>
          <option value="tarjeta-credito">Tarjeta de credito</option>
        </select>
        <select
          value={statementFilter}
          onChange={(event) =>
            onStatementFilterChange(event.target.value as MovementStatementFilter)
          }
        >
          <option value="all">Todos los estados TC</option>
          <option value="facturados">Facturados</option>
          <option value="no-facturados">No facturados</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Comercio</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Fuente</th>
              <th>Estado TC</th>
              <th>Ambito TC</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDateTime(transaction.fecha)}</td>
                <td>{transaction.nombreComercio}</td>
                <td>{transaction.categoria?.nombre || "Sin categoria"}</td>
                <td>
                  <span
                    className={`pill ${
                      transaction.tipoOperacion === "INGRESO" ? "pill-in" : "pill-out"
                    }`}
                  >
                    {transaction.tipoOperacion}
                  </span>
                </td>
                <td>{formatCurrencyClp(Number(transaction.monto))}</td>
                <td>{getSourceLabel(transaction)}</td>
                <td>{getStatementLabel(transaction)}</td>
                <td>{getScopeLabel(transaction)}</td>
              </tr>
            ))}
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row">
                  No hay movimientos para los filtros actuales.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};
