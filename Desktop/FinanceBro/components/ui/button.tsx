import type { ButtonHTMLAttributes, ReactElement, Ref } from "react";
import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius)] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-emerald-500/90 text-slate-900 hover:bg-emerald-400 shadow-glow-green",
        secondary: "bg-white/10 text-slate-100 hover:bg-white/20 border border-white/15",
        ghost: "text-slate-200 hover:bg-white/10",
        outline:
          "border border-emerald-400/70 text-emerald-200 hover:bg-emerald-400/10 shadow-glow-green/40"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-7 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && children) {
      const child = Children.only(children) as ReactElement;
      if (!isValidElement(child)) {
        throw new Error("Button with asChild requires a valid React element child.");
      }
      return cloneElement(child, {
        className: cn(classes, child.props.className),
        ref,
        ...props
      });
    }

    return (
      <button ref={ref as Ref<HTMLButtonElement>} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
