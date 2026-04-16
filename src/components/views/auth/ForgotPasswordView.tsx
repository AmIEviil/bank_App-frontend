import type { BaseSyntheticEvent } from "react";
import { Button } from "../../ui/Button";
import { TextInput } from "../../ui/TextInput";

interface ForgotPasswordViewProps {
  email: string;
  loading: boolean;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onEmailChange: (value: string) => void;
}

export const ForgotPasswordView = ({
  email,
  loading,
  onSubmit,
  onEmailChange,
}: ForgotPasswordViewProps) => {
  return (
    <form className="panel form-grid animated-rise" onSubmit={onSubmit}>
      <h2>Olvide password</h2>
      <p className="subtitle">
        Te generaremos un token temporal para continuar con el reseteo.
      </p>
      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="nombre@correo.cl"
      />
      <Button variant="primary" disabled={loading} type="submit">
        {loading ? "Generando..." : "Generar token"}
      </Button>
    </form>
  );
};
