import type { CargoProgramado } from "../../../../service/loginService";
import { formatCurrencyByCode } from "../../../../utils/currencyUtils";

interface CargosProgramadosTableProps {
  cargos: CargoProgramado[];
  loading: boolean;
  deleteLoading: boolean;
  onCreate: () => void;
  onEdit: (cargo: CargoProgramado) => void;
  onDelete: (id: number) => void;
}

const TIPO_LABEL: Record<CargoProgramado["tipo"], string> = {
  CUOTA: "Cuota",
  RECURRENTE: "Recurrente",
  AJUSTE: "Pago negativo",
};

const describeCuotas = (cargo: CargoProgramado): string => {
  if (cargo.tipo === "RECURRENTE") {
    return cargo.cantCuotas > 0 ? `${cargo.cantCuotas} meses` : "Sin término";
  }
  return `${cargo.cuotaActual}/${cargo.cantCuotas}`;
};

export const CargosProgramadosTable = ({
  cargos,
  loading,
  deleteLoading,
  onCreate,
  onEdit,
  onDelete,
}: CargosProgramadosTableProps) => (
  <div className="card">
    <div className="card-head">
      <div>
        <div className="card-title">Cargos programados</div>
        <div className="card-sub">
          Suscripciones, cuotas manuales y pagos negativos — {cargos.length}{" "}
          registrados
        </div>
      </div>
      <button className="btn-cta" type="button" onClick={onCreate}>
        + Nuevo cargo
      </button>
    </div>

    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th style={{ textAlign: "right" }}>Monto cuota</th>
            <th>Cuotas</th>
            <th>Mes ref.</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cargos.map((cargo) => {
            const monto = Number(cargo.montoCuota);
            return (
              <tr key={cargo.id} style={{ opacity: cargo.activo ? 1 : 0.5 }}>
                <td>
                  {cargo.nombre}
                  {cargo.notas && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: "var(--ink-3)",
                      }}
                    >
                      {cargo.notas}
                    </span>
                  )}
                </td>
                <td style={{ fontSize: 12 }}>{TIPO_LABEL[cargo.tipo]}</td>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    textAlign: "right",
                    color: monto < 0 ? "var(--gain)" : "var(--ink-0)",
                  }}
                >
                  {formatCurrencyByCode(monto, cargo.moneda)}
                </td>
                <td style={{ fontFamily: "var(--mono)" }}>
                  {describeCuotas(cargo)}
                </td>
                <td style={{ fontFamily: "var(--mono)" }}>
                  {cargo.mesReferencia}
                </td>
                <td style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {cargo.activo ? "Activo" : "Inactivo"}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => onEdit(cargo)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--ink-2)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      marginRight: 10,
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-link"
                    disabled={deleteLoading}
                    onClick={() => onDelete(cargo.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--loss)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
          {!loading && cargos.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                Sin cargos programados. Agrega tus suscripciones y los
                reembolsos de terceros para que la proyección cuadre.
              </td>
            </tr>
          )}
          {loading && (
            <tr>
              <td colSpan={7} className="empty-row">
                Cargando…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
