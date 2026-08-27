import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const classByVariant: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export const Button = ({
  variant = "secondary",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const classes = `${classByVariant[variant]} ${className || ""}`.trim();
  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};
