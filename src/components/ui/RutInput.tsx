import type { InputHTMLAttributes } from "react";
import { formatRut, isValidRut, sanitizeRutInput } from "../../utils/rutUtils";
import s from "./TextInput.module.css";

interface RutInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  error?: string;
}

export const RutInput = ({
  label,
  value,
  onChange,
  onValidityChange,
  id,
  error,
  ...props
}: RutInputProps) => {
  const inputId = id || label.toLowerCase().replaceAll(/\s+/g, "-");

  const handleBlur = () => {
    const formatted = formatRut(value);
    onChange(formatted);
    onValidityChange?.(isValidRut(formatted));
  };

  return (
    <label className={s.label} htmlFor={inputId}>
      <span>{label}</span>
      <input
        className={s.input}
        id={inputId}
        value={value}
        onChange={(event) => onChange(sanitizeRutInput(event.target.value))}
        onBlur={handleBlur}
        placeholder="12.345.678-5"
        {...props}
      />
      {error ? <small className={s.error}>{error}</small> : null}
    </label>
  );
};
