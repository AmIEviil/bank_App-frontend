import type { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput = ({ label, error, id, ...props }: TextInputProps) => {
  const inputId = id || label.toLowerCase().replaceAll(/\s+/g, "-");

  return (
    <label htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
};
