import type { ReactNode } from "react";

interface TabOption {
  value: string;
  label: string;
}

interface TabNavProps {
  options: TabOption[];
  active: string;
  onChange: (value: string) => void;
  extra?: ReactNode;
  privateMode?: boolean;
}

export const TabNav = ({
  options,
  active,
  onChange,
  extra,
  privateMode,
}: TabNavProps) => {
  return (
    <nav className={`tab-nav ${privateMode ? "private" : ""}`.trim()}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={active === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
      {extra}
    </nav>
  );
};
