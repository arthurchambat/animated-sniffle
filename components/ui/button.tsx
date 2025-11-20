import type { ButtonHTMLAttributes, ReactElement, Ref } from "react";
import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20",
        destructive:
          "bg-red-700 text-white hover:bg-red-600",
        outline:
          "border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-slate-100",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700",
        ghost: "hover:bg-slate-800 hover:text-slate-100",
        link: "text-emerald-500 underline-offset-4 hover:underline",
        
        // Custom Finance Variants
        primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 border border-transparent",
        "primary-glow": "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse border border-transparent",
        gold: "bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 shadow-lg shadow-amber-400/20 border border-transparent",
        glass: "bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 text-white hover:border-white/20",
        "glass-nav": "bg-slate-900/50 backdrop-blur-md border border-white/5 text-slate-300 hover:text-white hover:bg-white/5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-14 rounded-xl px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
