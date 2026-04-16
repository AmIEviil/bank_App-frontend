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
    <form className="panel form-grid animated-rise" onSubmit={onSubmit}>
      <h2>Crear cuenta</h2>
      <p className="subtitle">
        Registra tu perfil y comienza a centralizar tus gastos e ingresos.
      </p>
      <div className="inline-fields">
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
        label="Password"
        value={form.password}
        onChange={(event) => onChange("password", event.target.value)}
        placeholder="Minimo 8 caracteres"
      />
      <Button variant="primary" disabled={loading} type="submit">
        {loading ? "Creando..." : "Crear cuenta"}
      </Button>
    </form>
  );
};
