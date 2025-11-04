'use client';

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface PageScrollerProps extends HTMLAttributes<HTMLDivElement> {}

export const PageScroller = forwardRef<HTMLDivElement, PageScrollerProps>(
  ({ className, children, ...rest }, ref) => {
    // DEBUG: Log scroll container on mount
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { useEffect } = require("react");
      useEffect(() => {
        const scroller = document.querySelector('[data-page-scroller="true"]');
        console.log("✅ [PageScroller] Scroll container détecté:", scroller);
        
        const snapElements = document.querySelectorAll('[class*="snap-start"]');
        console.log("📍 [PageScroller] Éléments avec snap-start:", snapElements.length, snapElements);
        
        // Guide visuel temporaire (à retirer en production)
        snapElements.forEach((el, index) => {
          const separator = document.createElement("div");
          separator.style.cssText = 
            "position:absolute;top:0;left:0;right:0;height:4px;background:lime;z-index:9999;pointer-events:none;opacity:0.5;";
          separator.setAttribute("data-debug-separator", String(index));
          el.appendChild(separator);
        });
        
        return () => {
          document.querySelectorAll('[data-debug-separator]').forEach(el => el.remove());
        };
      }, []);
    }
    
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
