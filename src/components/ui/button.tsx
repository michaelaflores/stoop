import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover",
  secondary: "bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-hover",
  outline: "border border-border bg-surface text-foreground hover:bg-border active:bg-border",
  ghost: "text-foreground hover:bg-border active:bg-border",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-sm min-h-[40px]",
  lg: "px-6 py-3 text-base min-h-[44px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
