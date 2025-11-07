'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  return <>{children}</>;
};

interface SheetContentProps {
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  children: React.ReactNode;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const context = React.useContext(SheetContext);

    if (!context.open) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => context.onOpenChange?.(false)}
        />

        {/* Sheet panel */}
        <div
          ref={ref}
          className={cn(
            'fixed z-50 bg-[#0a0f1f] p-6 shadow-lg transition-transform',
            side === 'right' && 'inset-y-0 right-0 h-full border-l border-white/10',
            side === 'left' && 'inset-y-0 left-0 h-full border-r border-white/10',
            side === 'top' && 'inset-x-0 top-0 border-b border-white/10',
            side === 'bottom' && 'inset-x-0 bottom-0 border-t border-white/10',
            className
          )}
          {...props}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={() => context.onOpenChange?.(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          {children}
        </div>
      </>
    );
  }
);
SheetContent.displayName = 'SheetContent';

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-white', className)}
      {...props}
    />
  )
);
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-white/70', className)} {...props} />
));
SheetDescription.displayName = 'SheetDescription';

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
}>({
  open: false,
  onOpenChange: undefined
});

const SheetProvider = ({
  open,
  onOpenChange,
  children
}: {
  open: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
  children: React.ReactNode;
}) => {
  const value = React.useMemo(
    () => ({ open, onOpenChange }),
    [open, onOpenChange]
  );
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
};

const SheetWrapper = ({ open = false, onOpenChange, children }: SheetProps) => {
  return (
    <SheetProvider open={open} onOpenChange={onOpenChange}>
      {children}
    </SheetProvider>
  );
};

export { SheetWrapper as Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription };
