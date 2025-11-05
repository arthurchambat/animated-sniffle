import type { ButtonHTMLAttributes, ReactElement, Ref } from "react";
import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius)] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1f] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-white text-[#0a0f1f] hover:bg-white/90",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/40",
        ghost: "text-white hover:bg-white/10",
        outline:
          "border border-white/40 text-white hover:bg-white/10"
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
