import type { BaseSyntheticEvent } from "react";
import { Button } from "../../ui/Button";
import { PasswordInput } from "../../ui/PasswordInput";
import { TextInput } from "../../ui/TextInput";

interface LoginViewProps {
  email: string;
  password: string;
  loading: boolean;
  googleLoading: boolean;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onGoogleLogin: () => void;
  onGoRegister?: () => void;
  onGoForgot?: () => void;
}

export const LoginView = ({
  email,
  password,
  loading,
  googleLoading,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onGoogleLogin,
  onGoForgot,
}: LoginViewProps) => {
  return (
    <form className="auth-form-card animated-rise" onSubmit={onSubmit}>
      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="nombre@correo.cl"
      />
      <PasswordInput
        label="Contraseña"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        placeholder="••••••••"
      />
      {onGoForgot && (
        <div style={{ textAlign: "right", marginTop: -4 }}>
          <button
            type="button"
            className="btn-link"
            onClick={onGoForgot}
            style={{ fontSize: 12, color: "var(--ink-3)", padding: 0 }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
      <Button variant="primary" disabled={loading} type="submit" style={{ marginTop: 4 }}>
        {loading ? "Validando…" : "Iniciar sesión"}
      </Button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em" }}>O</span>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>
      <Button
        variant="secondary"
        type="button"
        disabled={googleLoading}
        onClick={onGoogleLogin}
      >
        <span style={{ fontWeight: 700, marginRight: 6 }}>G</span>
        {googleLoading ? "Conectando con Google…" : "Continuar con Google"}
      </Button>
    </form>
  );
};
