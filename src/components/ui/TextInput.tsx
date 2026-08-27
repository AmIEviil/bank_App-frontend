import type { InputHTMLAttributes } from "react";
import s from "./TextInput.module.css";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput = ({ label, error, id, ...props }: TextInputProps) => {
  const inputId = id || label.toLowerCase().replaceAll(/\s+/g, "-");

  return (
    <label className={s.label} htmlFor={inputId}>
      <span>{label}</span>
      <input className={s.input} id={inputId} {...props} />
      {error ? <small className={s.error}>{error}</small> : null}
    </label>
  );
};
