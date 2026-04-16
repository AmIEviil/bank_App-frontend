import type { Movimiento } from "../../../service/loginService";
import { formatCurrencyClp } from "../../../utils/currencyUtils";
import { Button } from "../../ui/Button";
import { PasswordInput } from "../../ui/PasswordInput";
import { RutInput } from "../../ui/RutInput";

interface SyncForm {
  rut: string;
  password: string;
}

interface ConfiguracionViewProps {
  syncForm: SyncForm;
  rutError: string;
  syncLoading: boolean;
  scrapedMovements: Movimiento[];
  onRutChange: (value: string) => void;
  onRutValidityChange: (valid: boolean) => void;
  onPasswordChange: (value: string) => void;
  onSync: () => void;
  onFetchScraping: () => void;
  onLogout: () => void;
}

export const ConfiguracionView = ({
  syncForm,
  rutError,
  syncLoading,
  scrapedMovements,
  onRutChange,
  onRutValidityChange,
  onPasswordChange,
  onSync,
  onFetchScraping,
  onLogout,
}: ConfiguracionViewProps) => {
  return (
    <section className="grid-2 animated-rise">
      <article className="panel form-grid">
        <h2>Configuracion</h2>
        <p className="subtitle">
          Gestiona sincronizacion bancaria y consulta del scraping.
        </p>
        <RutInput
          label="RUT Banco Chile"
          value={syncForm.rut}
          onChange={onRutChange}
          onValidityChange={onRutValidityChange}
          error={rutError}
        />
        <PasswordInput
          label="Password banco"
          value={syncForm.password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Password banco"
        />
        <div className="inline-actions">
          <Button type="button" variant="secondary" disabled={syncLoading} onClick={onSync}>
            {syncLoading ? "Enviando..." : "Iniciar sincronizacion"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={syncLoading}
            onClick={onFetchScraping}
          >
            {syncLoading ? "Consultando..." : "Cargar scraping"}
          </Button>
        </div>
        <Button type="button" variant="ghost" onClick={onLogout}>
          Cerrar sesion
        </Button>
      </article>
      <article className="panel">
        <h3>Preview scraping</h3>
        <p className="subtitle">
          Esta vista muestra los movimientos crudos retornados por Banco Chile.
        </p>
        <ul className="activity-list">
          {scrapedMovements.slice(0, 10).map((movement, index) => (
            <li key={`${movement.fecha}-${movement.descripcion}-${index}`}>
              <div>
                <strong>{movement.descripcion}</strong>
                <span>{movement.channel}</span>
              </div>
              <div>
                <span>{movement.fecha}</span>
                <strong>{formatCurrencyClp(movement.amount)}</strong>
              </div>
            </li>
          ))}
          {scrapedMovements.length === 0 ? (
            <li className="empty-item">
              Sin datos scrapeados aun. Ejecuta sincronizacion para continuar.
            </li>
          ) : null}
        </ul>
      </article>
    </section>
  );
};
