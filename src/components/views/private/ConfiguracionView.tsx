import type {
  Movimiento,
  TarjetaBancaria,
  DataSourceItem,
  CreateTarjetaDto,
  UpdateTarjetaPayload,
} from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { PasswordInput } from "../../ui/PasswordInput";
import { RutInput } from "../../ui/RutInput";
import { useModalStore } from "../../../store/appStore";
import { TarjetaFormModal } from "../../ui/TarjetaFormModal";
import { Button } from "../../ui/Button";
import { IndicadoresCard } from "./IndicadoresCard";

const DATA_SOURCE_LABELS: Record<string, string> = {
  BANCO_CHILE_CC: "Banco Chile — CTA. Corriente",
  BANCO_CHILE_TC: "Banco Chile — Tarjeta Crédito",
  GMAIL: "Gmail",
  MERCADO_PAGO: "MercadoPago",
};

const DATA_SOURCE_ICO: Record<string, string> = {
  BANCO_CHILE_CC: "▣",
  BANCO_CHILE_TC: "◈",
  GMAIL: "✉",
  MERCADO_PAGO: "◇",
};

interface SyncForm {
  rut: string;
  password: string;
}

interface MpSyncForm {
  email: string;
  password: string;
}

interface ConfiguracionViewProps {
  syncForm: SyncForm;
  mpSyncForm: MpSyncForm;
  rutError: string;
  syncLoading: boolean;
  mpSyncLoading: boolean;
  googleLinked: boolean;
  googleLinkLoading: boolean;
  scrapedMovements: Movimiento[];
  dataSources: DataSourceItem[];
  tarjetas: TarjetaBancaria[];
  tarjetasLoading: boolean;
  onRutChange: (value: string) => void;
  onRutValidityChange: (valid: boolean) => void;
  onPasswordChange: (value: string) => void;
  onMpEmailChange: (value: string) => void;
  onMpPasswordChange: (value: string) => void;
  onLinkGoogle: () => void;
  onSync: () => void;
  onMpSync: () => void;
  onFetchScraping: () => void;
  onLogout: () => void;
  onCreateTarjeta: (dto: CreateTarjetaDto) => void;
  onUpdateTarjeta: (args: { id: number; dto: UpdateTarjetaPayload }) => void;
  onDeleteTarjeta: (id: number) => void;
  tarjetaCreateLoading: boolean;
  tarjetaUpdateLoading: boolean;
}

export const ConfiguracionView = ({
  syncForm,
  mpSyncForm,
  rutError,
  syncLoading,
  mpSyncLoading,
  googleLinked,
  googleLinkLoading,
  scrapedMovements,
  dataSources,
  tarjetas,
  tarjetasLoading,
  onRutChange,
  onRutValidityChange,
  onPasswordChange,
  onMpEmailChange,
  onMpPasswordChange,
  onLinkGoogle,
  onSync,
  onMpSync,
  onFetchScraping,
  onLogout,
  onCreateTarjeta,
  onUpdateTarjeta,
  onDeleteTarjeta,
  tarjetaCreateLoading,
  tarjetaUpdateLoading,
}: ConfiguracionViewProps) => {
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);

  const openTarjetaModal = (opts: {
    tarjeta?: TarjetaBancaria | null;
    defaultDataSourceId?: number | null;
  }) => {
    openModal({
      header: opts.tarjeta ? "Editar tarjeta" : "Configurar tarjeta",
      content: (
        <TarjetaFormModal
          tarjeta={opts.tarjeta}
          dataSources={dataSources}
          defaultDataSourceId={opts.defaultDataSourceId ?? null}
          loading={opts.tarjeta ? tarjetaUpdateLoading : tarjetaCreateLoading}
          onCancel={closeModal}
          onSave={(dto) => {
            if (opts.tarjeta) {
              onUpdateTarjeta({ id: opts.tarjeta.id, dto });
            } else {
              onCreateTarjeta(dto);
            }
            closeModal();
          }}
        />
      ),
    });
  };

  let googleButtonLabel = "Vincular Google";
  if (googleLinked) googleButtonLabel = "Google vinculado";
  else if (googleLinkLoading) googleButtonLabel = "Conectando…";

  return (
    <div style={{ display: "grid", gap: "var(--gap)" }}>
      <IndicadoresCard />

      <div className="grid-2-col">
        {/* Left column: sync forms */}
        <div style={{ display: "grid", gap: "var(--gap)" }}>
          {/* Banco Chile sync */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Banco de Chile</div>
                <div className="card-sub">
                  Cuenta corriente y tarjeta de crédito
                </div>
              </div>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--gain)",
                }}
              />
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <RutInput
                label="RUT"
                value={syncForm.rut}
                onChange={onRutChange}
                onValidityChange={onRutValidityChange}
                error={rutError}
              />
              <PasswordInput
                label="Contraseña banco"
                value={syncForm.password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Contraseña banco"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="primary"
                  disabled={syncLoading}
                  onClick={onSync}
                  style={{ flex: 1 }}
                >
                  {syncLoading ? "Enviando…" : "Iniciar sincronización"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={syncLoading}
                  onClick={onFetchScraping}
                >
                  {syncLoading ? "…" : "Cargar scraping"}
                </Button>
              </div>
            </div>
          </div>

          {/* MercadoPago sync */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">MercadoPago</div>
                <div className="card-sub">Reservas y saldos</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 5 }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--ink-3)",
                  }}
                >
                  Email
                </span>
                <input
                  type="email"
                  value={mpSyncForm.email}
                  onChange={(e) => onMpEmailChange(e.target.value)}
                  placeholder="usuario@gmail.com"
                />
              </label>
              <PasswordInput
                label="Contraseña"
                value={mpSyncForm.password}
                onChange={(e) => onMpPasswordChange(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                variant="primary"
                disabled={mpSyncLoading}
                onClick={onMpSync}
              >
                {mpSyncLoading ? "Sincronizando…" : "Sincronizar Reservas"}
              </Button>
            </div>
          </div>

          {/* Account */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Cuenta</div>
                <div className="card-sub">Vinculaciones y sesión</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--ink-0)",
                    }}
                  >
                    Google
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--ink-3)",
                      marginTop: 2,
                    }}
                  >
                    {googleLinked ? "Cuenta vinculada" : "No vinculado"}
                  </div>
                </div>
                <Button
                  variant={googleLinked ? "secondary" : "primary"}
                  disabled={googleLinked || googleLinkLoading}
                  onClick={onLinkGoogle}
                  style={{ width: "auto", padding: "7px 14px", fontSize: 12 }}
                >
                  {googleButtonLabel}
                </Button>
              </div>
              <div style={{ paddingTop: 4 }}>
                <button
                  className="btn-ghost"
                  onClick={onLogout}
                  style={{
                    width: "100%",
                    color: "var(--loss)",
                    borderColor: "rgba(255,138,138,0.3)",
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: scraping preview */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Preview scraping</div>
              <div className="card-sub">Movimientos crudos del crawler</div>
            </div>
            <span className="tag">{scrapedMovements.length} items</span>
          </div>
          <ul className="tx-list">
            {scrapedMovements.slice(0, 12).map((movement, index) => (
              <li
                key={`${movement.fecha}-${movement.descripcion}-${index}`}
                className="tx-item"
              >
                <div className="tx-ico">·</div>
                <div className="tx-info">
                  <div className="tx-name">{movement.descripcion}</div>
                  <div className="tx-cat">
                    {movement.channel} · {movement.fecha}
                  </div>
                </div>
                <div className="tx-amt">
                  {formatCurrencyClp(movement.amount)}
                </div>
              </li>
            ))}
            {scrapedMovements.length === 0 && (
              <li
                style={{
                  padding: "16px 0",
                  fontSize: 13,
                  color: "var(--ink-3)",
                  textAlign: "center",
                }}
              >
                Sin datos scrapeados. Ejecuta la sincronización para continuar.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Data sources + tarjetas section */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Fuentes vinculadas</div>
            <div className="card-sub">
              Configura una tarjeta por cada fuente activa
            </div>
          </div>
          <button className="btn-cta" onClick={() => openTarjetaModal({})}>
            + Nueva tarjeta
          </button>
        </div>

        {dataSources && dataSources.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--ink-3)", padding: "12px 0" }}>
            Sin fuentes vinculadas. Sincroniza primero desde Banco Chile o
            MercadoPago.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {dataSources.map((ds) => {
              const linked = tarjetas.filter((t) => t.dataSourceId === ds.id);
              return (
                <div
                  key={ds.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "var(--bg-2)",
                    border: "1px solid var(--line)",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {/* Source header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
                        {DATA_SOURCE_ICO[ds.tipo] ?? "○"}
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--ink-0)",
                          }}
                        >
                          {DATA_SOURCE_LABELS[ds.tipo] ?? ds.tipo}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 10,
                            color: "var(--ink-3)",
                            marginTop: 1,
                          }}
                        >
                          {ds.identificador}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-outline"
                      style={{ fontSize: 11, padding: "5px 12px" }}
                      onClick={() =>
                        openTarjetaModal({ defaultDataSourceId: ds.id })
                      }
                    >
                      + Tarjeta
                    </button>
                  </div>

                  {/* Linked tarjetas */}
                  {linked.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gap: 6,
                        paddingTop: 8,
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      {linked.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: 9,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                padding: "2px 7px",
                                borderRadius: 6,
                                background:
                                  t.tipoTarjeta === "credito"
                                    ? "rgba(124,243,196,0.1)"
                                    : "rgba(158,197,255,0.1)",
                                color:
                                  t.tipoTarjeta === "credito"
                                    ? "var(--gain)"
                                    : "var(--info)",
                                border: `1px solid ${t.tipoTarjeta === "credito" ? "rgba(124,243,196,0.25)" : "rgba(158,197,255,0.25)"}`,
                                flexShrink: 0,
                              }}
                            >
                              {t.tipoTarjeta}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "var(--ink-0)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {t.nombre}
                              </div>
                              <div
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: 10,
                                  color: "var(--ink-3)",
                                }}
                              >
                                {t.nroTarjeta}
                                {t.tipoTarjeta === "credito" &&
                                  t.fechaFacturacion && (
                                    <> · cierre día {t.fechaFacturacion}</>
                                  )}
                                {t.tipoTarjeta === "credito" &&
                                  t.montoUtilizado != null &&
                                  t.montoTotal != null && (
                                    <>
                                      {" "}
                                      · {formatCurrencyClp(
                                        t.montoUtilizado,
                                      )} / {formatCurrencyClp(t.montoTotal)}
                                    </>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", gap: 6, flexShrink: 0 }}
                          >
                            <button
                              className="btn-outline"
                              style={{ fontSize: 11, padding: "4px 10px" }}
                              onClick={() => openTarjetaModal({ tarjeta: t })}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-outline"
                              style={{
                                fontSize: 11,
                                padding: "4px 10px",
                                color: "var(--loss)",
                                borderColor: "rgba(255,138,138,0.25)",
                              }}
                              onClick={() => onDeleteTarjeta(t.id)}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {linked.length === 0 && !tarjetasLoading && (
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        color: "var(--ink-3)",
                        paddingTop: 4,
                      }}
                    >
                      Sin tarjetas configuradas para esta fuente.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tarjetas sin data source */}
        {(() => {
          const unlinked = tarjetas.filter((t) => !t.dataSourceId);
          if (unlinked.length === 0) return null;
          return (
            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid var(--line)",
                paddingTop: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "var(--ink-3)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Sin fuente vinculada
              </div>
              {unlinked.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--ink-1)" }}>
                    {t.nombre} · {t.nroTarjeta}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn-outline"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => openTarjetaModal({ tarjeta: t })}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-outline"
                      style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        color: "var(--loss)",
                        borderColor: "rgba(255,138,138,0.25)",
                      }}
                      onClick={() => onDeleteTarjeta(t.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
