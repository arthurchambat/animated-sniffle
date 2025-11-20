import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const id = props.id || props.name;

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-200">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-finance border bg-finance-midnight/40 px-4 py-3 text-sm text-foreground backdrop-blur-sm transition-all",
            "placeholder:text-muted-foreground",
            "focus:border-finance-green focus:outline-none focus:ring-2 focus:ring-finance-green/20",
            "hover:bg-finance-midnight/60",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-destructive focus:ring-destructive/20" : "border-white/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-300">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
