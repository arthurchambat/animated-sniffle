import { cn } from "@/lib/cn";

interface DisplayRowProps {
  label: string;
  value?: string | null;
  placeholder?: string;
  className?: string;
}

/**
 * Responsive label-value row for read-only display.
 * Label on left (md:col-span-4), value on right (md:col-span-8).
 */
export function DisplayRow({ label, value, placeholder = "—", className }: DisplayRowProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-4", className)}>
      <dt className="text-sm font-medium text-muted-foreground md:col-span-4">{label}</dt>
      <dd className="break-words text-sm text-white/90 md:col-span-8">
        {value || <span className="text-white/40">{placeholder}</span>}
      </dd>
    </div>
  );
}
