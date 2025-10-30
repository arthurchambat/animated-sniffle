import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const bentoCardVariants = cva(
  "bento-card relative overflow-hidden border border-white/10",
  {
    variants: {
      emphasis: {
        default: "",
        primary: "ring-1 ring-emerald-400/50",
        accent: "ring-1 ring-amber-300/40"
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      }
    },
    defaultVariants: {
      emphasis: "default",
      padding: "md"
    }
  }
);

export interface BentoCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoCardVariants> {}

export function BentoCard({ className, emphasis, padding, ...props }: BentoCardProps) {
  return (
    <div className={cn(bentoCardVariants({ emphasis, padding }), className)} {...props} />
  );
}
