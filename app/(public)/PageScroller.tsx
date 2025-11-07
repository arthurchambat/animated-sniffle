'use client';

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface PageScrollerProps extends HTMLAttributes<HTMLDivElement> {}

export const PageScroller = forwardRef<HTMLDivElement, PageScrollerProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-page-scroller="true"
        tabIndex={0}
        className={cn(
          // Conteneur de scroll strict : une section à la fois
          "relative h-dvh w-full overflow-y-auto overscroll-y-contain",
          "snap-y snap-mandatory",
          className
        )}
        style={{ 
          scrollPaddingTop: "0px", // Pas de padding, on veut les sections à 0,0
          scrollBehavior: "smooth"
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

PageScroller.displayName = "PageScroller";
