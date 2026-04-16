import { useState } from "react";
import type { InputHTMLAttributes } from "react";

interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  error?: string;
}

export const PasswordInput = ({
  label,
  error,
  id,
  ...props
}: PasswordInputProps) => {
  const [show, setShow] = useState(false);
  const inputId = id || label.toLowerCase().replaceAll(/\s+/g, "-");

  return (
    <label htmlFor={inputId}>
      <span>{label}</span>
      <div className="password-field">
        <input id={inputId} type={show ? "text" : "password"} {...props} />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? "Ocultar password" : "Mostrar password"}
        >
          {show ? "Ocultar" : "Ver"}
        </button>
      </div>
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
};
