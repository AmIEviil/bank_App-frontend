import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import s from "./TextInput.module.css";
import EyeIcon from "./icons/EyeIcon";

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
    <label className={s.label} htmlFor={inputId}>
      <span>{label}</span>
      <div className={s.passwordField}>
        <input
          className={s.input}
          id={inputId}
          type={show ? "text" : "password"}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? "Ocultar password" : "Mostrar password"}
          className={s.eyeButton}
        >
          <EyeIcon open={show} size={24} className={s.eye} color="currentColor"/>
        </button>
      </div>
      {error ? <small className={s.error}>{error}</small> : null}
    </label>
  );
};
