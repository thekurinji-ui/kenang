import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5",
          "font-body font-medium text-sm transition-all active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          variant === "primary" && "bg-crimson text-neutral-white hover:bg-crimson-600",
          variant === "secondary" &&
            "bg-neutral-white text-neutral-midnight border border-neutral-slate hover:bg-neutral-slate/40",
          variant === "ghost" && "bg-transparent text-neutral-midnight hover:bg-neutral-slate/40",
          variant === "danger" && "bg-transparent text-crimson hover:bg-crimson-50",
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
