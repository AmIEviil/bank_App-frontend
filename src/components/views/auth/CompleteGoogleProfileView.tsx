import type { BaseSyntheticEvent } from "react";
import { Button } from "../../ui/Button";
import { RutInput } from "../../ui/RutInput";

interface CompleteGoogleProfileViewProps {
  rut: string;
  rutError: string;
  loading: boolean;
  onRutChange: (rut: string) => void;
  onRutValidityChange: (isValid: boolean) => void;
  onSubmit: (event: BaseSyntheticEvent) => void;
}

export const CompleteGoogleProfileView = ({
  rut,
  rutError,
  loading,
  onRutChange,
  onRutValidityChange,
  onSubmit,
}: CompleteGoogleProfileViewProps) => {
  return (
    <form className="panel form-grid animated-rise" onSubmit={onSubmit}>
      <h2>Completa tu perfil</h2>
      <p className="subtitle">
        Para continuar con tu cuenta de Google, confirma tu RUT real.
      </p>
      <RutInput
        label="RUT"
        value={rut}
        onChange={onRutChange}
        onValidityChange={onRutValidityChange}
        error={rutError}
      />
      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar RUT y continuar"}
      </Button>
    </form>
  );
};
