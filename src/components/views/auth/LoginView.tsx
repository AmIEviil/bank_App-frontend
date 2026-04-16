import type { BaseSyntheticEvent } from "react";
import { Button } from "../../ui/Button";
import { PasswordInput } from "../../ui/PasswordInput";
import { TextInput } from "../../ui/TextInput";

interface LoginViewProps {
  email: string;
  password: string;
  loading: boolean;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export const LoginView = ({
  email,
  password,
  loading,
  onSubmit,
  onEmailChange,
  onPasswordChange,
}: LoginViewProps) => {
  return (
    <form className="panel form-grid animated-rise" onSubmit={onSubmit}>
      <h2>Bienvenido de vuelta</h2>
      <p className="subtitle">
        Inicia sesion para ver tu dashboard financiero en tiempo real.
      </p>
      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="nombre@correo.cl"
      />
      <PasswordInput
        label="Password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        placeholder="********"
      />
      <Button variant="primary" disabled={loading} type="submit">
        {loading ? "Validando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
};
