"use client";

import { Button } from "@/components/ui/button";
import { DIALOG_PANEL } from "@/lib/ui/dialog-classes";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

export type ManagementDialogMode = "create" | "edit" | "view" | "filter";

export type ManagementDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  mode?: ManagementDialogMode;
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  className?: string;
  hideModeLabel?: boolean;
};

const MODE_LABEL: Record<ManagementDialogMode, string> = {
  create: "Create",
  edit: "Edit",
  view: "Details",
  filter: "Filters",
};

export function ManagementDialog({
  open,
  onClose,
  title,
  mode = "edit",
  children,
  footer,
  closeOnBackdrop = true,
  className,
  hideModeLabel = false,
}: ManagementDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onCloseEvent = () => {
      returnFocusRef.current?.focus();
    };

    dialog.addEventListener("close", onCloseEvent);
    return () => dialog.removeEventListener("close", onCloseEvent);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="management-dialog-title"
      className={cn(DIALOG_PANEL, className)}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
        returnFocusRef.current?.focus();
      }}
      onClick={(event) => {
        if (!closeOnBackdrop) return;
        const dialog = dialogRef.current;
        if (!dialog || event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const clickedOutside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom;
        if (clickedOutside) {
          onClose();
          returnFocusRef.current?.focus();
        }
      }}
    >
      <div className="flex max-h-[min(90vh,720px)] flex-col overflow-visible">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {!hideModeLabel ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {MODE_LABEL[mode]}
              </p>
            ) : null}
            <h2
              id="management-dialog-title"
              className="text-lg font-semibold text-ink"
            >
              {title}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 px-2"
            aria-label="Close dialog"
            onClick={() => {
              onClose();
              returnFocusRef.current?.focus();
            }}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </header>

        <div className="flex-1 overflow-visible px-5 py-4">{children}</div>

        {footer ? (
          <footer className="relative z-0 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
