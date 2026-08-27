import type { Reserva } from "../../../types/reserva.types";
import { formatCurrencyByCode } from "../../../utils/currencyUtils";

interface ReservasMercadoPagoViewProps {
  reservas: Reserva[];
  loading: boolean;
}

export const ReservasMercadoPagoView = ({ reservas, loading }: ReservasMercadoPagoViewProps) => {
  const totalCLP = reservas.reduce((acc, res) => acc + (parseFloat(res.monto) || 0), 0);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Cargando reservas…
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      {/* Hero */}
      <div className="hero-card">
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>
          MercadoPago · Reservas
        </div>
        <div className="hero-balance">{formatCurrencyByCode(totalCLP, "CLP")}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>
          {reservas.length} {reservas.length === 1 ? "reserva activa" : "reservas activas"}
        </div>
      </div>

      {/* Vault Grid */}
      {reservas.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
            Sin reservas sincronizadas. Ve a Configuración para ejecutar la sincronización.
          </p>
        </div>
      ) : (
        <div className="vault-grid">
          {reservas.map((res) => (
            <div className="vault" key={res.id}>
              <div className="vault-mark">◇</div>
              <div className="vault-name">{res.nombre}</div>
              <div className="vault-amt">{formatCurrencyByCode(parseFloat(res.monto), "CLP")}</div>
              {res.fuente && (
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>
                  {res.fuente.identificador}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
