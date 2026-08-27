import type { BaseSyntheticEvent } from "react";
import { Button } from "../../ui/Button";
import { PasswordInput } from "../../ui/PasswordInput";
import { RutInput } from "../../ui/RutInput";
import { TextInput } from "../../ui/TextInput";

interface RegisterForm {
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  password: string;
}

interface CreateAccountViewProps {
  form: RegisterForm;
  rutError: string;
  loading: boolean;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (field: keyof RegisterForm, value: string) => void;
  onRutValidityChange: (isValid: boolean) => void;
  onGoLogin?: () => void;
}

export const CreateAccountView = ({
  form,
  rutError,
  loading,
  onSubmit,
  onChange,
  onRutValidityChange,
}: CreateAccountViewProps) => {
  return (
    <form className="auth-form-card animated-rise" onSubmit={onSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextInput
          label="Nombre"
          value={form.nombre}
          onChange={(event) => onChange("nombre", event.target.value)}
          placeholder="Nombre"
        />
        <TextInput
          label="Apellido"
          value={form.apellido}
          onChange={(event) => onChange("apellido", event.target.value)}
          placeholder="Apellido"
        />
      </div>
      <TextInput
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => onChange("email", event.target.value)}
        placeholder="nombre@correo.cl"
      />
      <RutInput
        label="RUT"
        value={form.rut}
        onChange={(rut) => onChange("rut", rut)}
        onValidityChange={onRutValidityChange}
        error={rutError}
      />
      <PasswordInput
        label="Contraseña"
        value={form.password}
        onChange={(event) => onChange("password", event.target.value)}
        placeholder="Mínimo 8 caracteres"
      />
      <Button variant="primary" disabled={loading} type="submit" style={{ marginTop: 4 }}>
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
};
