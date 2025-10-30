
import { cn } from "@/lib/cn";

interface FinanceLogoMarkProps {
  className?: string;
}

export function FinanceLogoMark({ className }: FinanceLogoMarkProps) {
  return (
    <span
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500",
        "shadow-lg shadow-emerald-500/30 ring-1 ring-white/30",
        className
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/15 via-transparent to-black/20" />
      <svg
        viewBox="0 0 32 32"
        role="presentation"
        className="relative h-6 w-6 text-white"
      >
        <path
          d="M6 21.5 12.2 15l4.2 4.5L25 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 13.5h4.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={0.55}
        />
        <circle cx="6" cy="21.5" r="2" fill="currentColor" />
        <path
          d="M18 13.2c1.8-1.4 4-2.2 6.2-2.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
          opacity={0.45}
        />
      </svg>
    </span>
  );
}
