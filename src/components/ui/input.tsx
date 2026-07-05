import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="font-body text-sm font-medium text-neutral-midnight">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2.5",
            "font-body text-sm text-neutral-midnight placeholder:text-neutral-midnight/40",
            "focus:outline-none focus:ring-2 focus:ring-crimson/40 focus:border-crimson",
            "transition-colors",
            error && "border-crimson focus:ring-crimson/40",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-crimson font-body">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
