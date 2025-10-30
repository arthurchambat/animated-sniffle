'use client';

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface PageScrollerProps extends HTMLAttributes<HTMLDivElement> {}

export const PageScroller = forwardRef<HTMLDivElement, PageScrollerProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      data-page-scroller="true"
      tabIndex={0}
      className={cn(
        "relative h-[100dvh] w-full overflow-y-auto overscroll-contain",
        "scroll-smooth snap-y snap-mandatory",
        className
      )}
      style={{ scrollPaddingTop: "var(--header-h, 72px)" }}
      {...rest}
    >
      {children}
    </div>
  )
);

PageScroller.displayName = "PageScroller";
