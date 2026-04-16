import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const classByVariant: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export const Button = ({
  variant = "secondary",
  className,
  children,
  ...props
}: ButtonProps) => {
  const classes = `${classByVariant[variant]} ${className || ""}`.trim();
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
