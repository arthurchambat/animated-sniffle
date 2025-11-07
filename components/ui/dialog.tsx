'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DialogContextValue {
  open: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within Dialog');
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleOpenChange]);

  const value = React.useMemo(
    () => ({ open, onOpenChange: handleOpenChange }),
    [open, handleOpenChange]
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DialogTrigger({ asChild = false, children }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { onClick?: (e: React.MouseEvent) => void };
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        onOpenChange?.(true);
        childProps.onClick?.(e);
      }
    } as any);
  }

  return (
    <button type="button" onClick={() => onOpenChange?.(true)}>
      {children}
    </button>
  );
}

interface DialogPortalProps {
  children: React.ReactNode;
}

export function DialogPortal({ children }: DialogPortalProps) {
  const { open } = useDialogContext();
  if (!open) return null;

  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(children, document.body);
}

// Fix for React 19 - import ReactDOM properly
import ReactDOM from 'react-dom';

interface DialogOverlayProps {
  className?: string;
}

export function DialogOverlay({ className }: DialogOverlayProps) {
  const { onOpenChange } = useDialogContext();

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      onClick={() => onOpenChange?.(false)}
      data-state="open"
    />
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}

export function DialogContent({ className, children, showClose = true }: DialogContentProps) {
  const { onOpenChange } = useDialogContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Focus trap
  React.useEffect(() => {
    if (!contentRef.current) return;

    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={contentRef}
          className={cn(
            'relative w-full max-w-lg md:max-w-2xl',
            'rounded-2xl border border-white/15 bg-[#0a0f1f] p-6 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'max-h-[90vh] overflow-y-auto',
            className
          )}
          onClick={(e) => e.stopPropagation()}
          data-state="open"
        >
          {children}
          {showClose && (
            <button
              onClick={() => onOpenChange?.(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Fermer"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </DialogPortal>
  );
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
      {children}
    </div>
  );
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-400', className)}>
      {children}
    </p>
  );
}
