import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface StickySectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  heightClassName?: string;
}

export function StickySection({
  id,
  children,
  className,
  contentClassName,
  heightClassName
}: StickySectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative h-[150vh] w-full snap-start",
        "md:h-[160vh]",
        className
      )}
    >
      <div
        className={cn(
          "sticky top-0 grid h-screen place-items-center",
          heightClassName
        )}
      >
        <div className={cn("w-full max-w-6xl px-6 md:px-12", contentClassName)}>{children}</div>
      </div>
    </section>
  );
}
