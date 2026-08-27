import type { BaseSyntheticEvent } from "react";
import { Button } from "../../ui/Button";
import { TextInput } from "../../ui/TextInput";

interface ForgotPasswordViewProps {
  email: string;
  loading: boolean;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onEmailChange: (value: string) => void;
  onGoLogin?: () => void;
}

export const ForgotPasswordView = ({
  email,
  loading,
  onSubmit,
  onEmailChange,
  onGoLogin,
}: ForgotPasswordViewProps) => {
  return (
    <form className="auth-form-card animated-rise" onSubmit={onSubmit}>
      <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 4 }}>
        Te enviaremos un token temporal para continuar con el reseteo de contraseña.
      </p>
      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="nombre@correo.cl"
      />
      <Button variant="primary" disabled={loading} type="submit">
        {loading ? "Generando…" : "Generar token"}
      </Button>
      {onGoLogin && (
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            className="btn-link"
            onClick={onGoLogin}
            style={{ fontSize: 12, color: "var(--ink-3)", padding: 0 }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      )}
    </form>
  );
};
