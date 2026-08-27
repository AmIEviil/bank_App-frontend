import { useState } from "react";
import { TabNav } from "../../../ui/TabNav";
import { CargoProgramadoFormModal } from "./CargoProgramadoFormModal";
import { CargosProgramadosTable } from "./CargosProgramadosTable";
import { useModalStore } from "../../../../store/appStore";
import {
  PROJECTION_HORIZONS,
  useProyeccionData,
} from "../../../../hooks/useProyeccionData";
import type { ProjectionHorizon } from "../../../../hooks/useProyeccionData";
import type {
  CargoProgramado,
  CreateCargoProgramadoDto,
  ProjectionMonth,
} from "../../../../service/loginService";
import {
  formatCurrencyByCode,
  formatCurrencyClp,
} from "../../../../utils/currencyUtils";

const formatMonthLabel = (monthKey: string): string => {
  const parsed = new Date(`${monthKey}-01T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return monthKey;
  return new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
};

const TIPO_LABEL: Record<string, string> = {
  CUOTA: "Cuota",
  RECURRENTE: "Recurrente",
  AJUSTE: "Pago negativo",
};

const formatDateOnly = (value: string): string => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

interface MonthRowProps {
  item: ProjectionMonth;
  maxTotal: number;
  expanded: boolean;
  onToggle: () => void;
}

const MonthRow = ({ item, maxTotal, expanded, onToggle }: MonthRowProps) => {
  const pct =
    maxTotal > 0 ? Math.max((item.totalCLPConvertido / maxTotal) * 100, 4) : 4;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          width: "100%",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
          {expanded ? "▾" : "▸"} {formatMonthLabel(item.month)}
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              marginLeft: 8,
            }}
          >
            {item.movements.length} mov.
          </span>
        </span>
        <strong
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            color: "var(--ink-0)",
          }}
        >
          {formatCurrencyClp(item.totalCLPConvertido)}
          {item.totalUSD !== 0 && (
            <span style={{ color: "var(--ink-3)", marginLeft: 8, fontSize: 11 }}>
              incl. {formatCurrencyByCode(item.totalUSD, "USD")}
            </span>
          )}
        </strong>
      </button>

      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: "var(--ink-3)",
        }}
      >
        <span>Cuotas {formatCurrencyClp(item.totalCuotasCLP)}</span>
        <span>Recurrentes {formatCurrencyClp(item.totalRecurrentesCLP)}</span>
        <span style={{ color: item.totalAjustesCLP < 0 ? "var(--gain)" : undefined }}>
          Ajustes {formatCurrencyClp(item.totalAjustesCLP)}
        </span>
      </div>

      {expanded && (
        <div className="table-wrap" style={{ marginTop: 4 }}>
          <table>
            <thead>
              <tr>
                <th>Detalle</th>
                <th>Cuota</th>
                <th>Tipo</th>
                <th>Origen</th>
                <th style={{ textAlign: "right" }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {item.movements.map((movement) => (
                <tr
                  key={movement.id}
                  style={{ opacity: movement.duplicado ? 0.45 : 1 }}
                >
                  <td>
                    {movement.descripcion}
                    {movement.duplicado && (
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          color: "var(--loss)",
                          marginLeft: 6,
                        }}
                      >
                        duplicado — no suma
                      </span>
                    )}
                    {movement.notas && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "var(--ink-3)",
                        }}
                      >
                        {movement.notas}
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: "var(--mono)" }}>
                    {movement.cuotaLabel}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {TIPO_LABEL[movement.tipo] ?? movement.tipo}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {movement.origen === "manual" ? "Manual" : "Banco"}
                  </td>
                  <td
                    style={{
                      fontFamily: "var(--mono)",
                      textAlign: "right",
                      color:
                        movement.amount < 0 ? "var(--gain)" : "var(--ink-0)",
                    }}
                  >
                    {formatCurrencyByCode(movement.amount, movement.currency)}
                  </td>
                </tr>
              ))}
              {item.movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Sin cargos proyectados para este mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const ProyeccionPanel = () => {
  const data = useProyeccionData();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const [expandedMonth, setExpandedMonth] = useState<string>("");

  const maxTotal = data.projection.months.length
    ? Math.max(...data.projection.months.map((item) => item.totalCLPConvertido))
    : 0;

  const { tipoCambio } = data.projection;

  const handleSave = (cargo: CargoProgramado | null) => (
    dto: CreateCargoProgramadoDto,
  ) => {
    if (cargo) {
      data.updateCargo({ id: cargo.id, dto });
    } else {
      data.createCargo(dto);
    }
    closeModal();
  };

  const openCargoModal = (cargo?: CargoProgramado | null) => {
    openModal({
      header: cargo ? "Editar cargo programado" : "Nuevo cargo programado",
      content: (
        <CargoProgramadoFormModal
          cargo={cargo}
          loading={data.createLoading || data.updateLoading}
          onSave={handleSave(cargo ?? null)}
          onCancel={closeModal}
        />
      ),
    });
  };

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Proyección de facturación</div>
            <div className="card-sub">
              Cuotas del banco + cargos programados — próximos {data.horizon}{" "}
              meses
            </div>
          </div>
          <TabNav
            privateMode
            options={PROJECTION_HORIZONS.map((value) => ({
              value: String(value),
              label: `${value}m`,
            }))}
            active={String(data.horizon)}
            onChange={(value) =>
              data.setHorizon(Number(value) as ProjectionHorizon)
            }
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--ink-3)",
                marginBottom: 4,
              }}
            >
              TOTAL {data.horizon} MESES
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 22,
                color: "var(--loss)",
              }}
            >
              {formatCurrencyClp(
                data.projection.totals.horizonTotalCLPConvertido,
              )}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--ink-3)",
                marginBottom: 4,
              }}
            >
              PROMEDIO MENSUAL
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 22,
                color: "var(--ink-1)",
              }}
            >
              {formatCurrencyClp(data.projection.totals.promedioMensualCLP)}
            </div>
          </div>
          {data.projection.totals.horizonTotalUSD !== 0 && (
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "var(--ink-3)",
                  marginBottom: 4,
                }}
              >
                DE ESO, EN USD
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 22,
                  color: "var(--ink-1)",
                }}
              >
                {formatCurrencyByCode(
                  data.projection.totals.horizonTotalUSD,
                  "USD",
                )}
              </div>
            </div>
          )}
        </div>

        {data.projection.totals.horizonTotalUSD !== 0 && (
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: tipoCambio.disponible ? "var(--ink-3)" : "var(--loss)",
              marginBottom: 12,
            }}
          >
            {tipoCambio.disponible
              ? `USD convertido a ${formatCurrencyClp(tipoCambio.valor)} — ${tipoCambio.nombre.toLowerCase()} del ${formatDateOnly(tipoCambio.fecha)} (mindicador.cl)`
              : "Sin tipo de cambio en la base de datos: los montos en USD no están sumados al total."}
          </div>
        )}

        <div className="bars-list">
          {data.projectionLoading && (
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Calculando proyección…
            </p>
          )}
          {!data.projectionLoading &&
            data.projection.months.map((item) => (
              <MonthRow
                key={item.month}
                item={item}
                maxTotal={maxTotal}
                expanded={expandedMonth === item.month}
                onToggle={() =>
                  setExpandedMonth((current) =>
                    current === item.month ? "" : item.month,
                  )
                }
              />
            ))}
          {!data.projectionLoading && data.projection.months.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Sin datos para proyectar.
            </p>
          )}
        </div>
      </div>

      <CargosProgramadosTable
        cargos={data.cargos}
        loading={data.cargosLoading}
        deleteLoading={data.deleteLoading}
        onCreate={() => openCargoModal(null)}
        onEdit={(cargo) => openCargoModal(cargo)}
        onDelete={(id) => data.deleteCargo(id)}
      />
    </div>
  );
};
