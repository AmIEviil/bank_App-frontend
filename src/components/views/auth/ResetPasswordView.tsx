import type { BaseSyntheticEvent } from "react";
import { Button } from "../../ui/Button";
import { PasswordInput } from "../../ui/PasswordInput";
import { TextInput } from "../../ui/TextInput";

interface ResetForm {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordViewProps {
  form: ResetForm;
  loading: boolean;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (field: keyof ResetForm, value: string) => void;
}

export const ResetPasswordView = ({
  form,
  loading,
  onSubmit,
  onChange,
}: ResetPasswordViewProps) => {
  return (
    <form className="panel form-grid animated-rise" onSubmit={onSubmit}>
      <h2>Restablecer password</h2>
      <p className="subtitle">
        Ingresa el token temporal y define una nueva password segura.
      </p>
      <TextInput
        label="Token"
        value={form.token}
        onChange={(event) => onChange("token", event.target.value)}
        placeholder="Token temporal"
      />
      <PasswordInput
        label="Nueva password"
        value={form.password}
        onChange={(event) => onChange("password", event.target.value)}
        placeholder="Minimo 8 caracteres"
      />
      <PasswordInput
        label="Confirmar password"
        value={form.confirmPassword}
        onChange={(event) => onChange("confirmPassword", event.target.value)}
        placeholder="Repite password"
      />
      <Button variant="primary" disabled={loading} type="submit">
        {loading ? "Aplicando..." : "Restablecer"}
      </Button>
    </form>
  );
};
