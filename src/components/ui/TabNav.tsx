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
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % options.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + options.length) % options.length;
    else return;
    e.preventDefault();
    onChange(options[next].value);
  };

  return (
    <nav
      role="tablist"
      className={`tab-nav ${privateMode ? "private" : ""}`.trim()}
    >
      {options.map((option, idx) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={active === option.value}
          className={active === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
        >
          {option.label}
        </button>
      ))}
      {extra}
    </nav>
  );
};
