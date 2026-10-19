"use client";

import { Button } from "@/components/ui/button";
import { DIALOG_PANEL } from "@/lib/ui/dialog-classes";
import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, type ReactNode } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  danger = false,
  closeOnBackdrop = true,
  className,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
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

  const restoreFocus = () => {
    returnFocusRef.current?.focus();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
      className={cn(DIALOG_PANEL, "max-w-md", className)}
      onCancel={(event) => {
        event.preventDefault();
        if (loading) return;
        onClose();
        restoreFocus();
      }}
      onClick={(event) => {
        if (!closeOnBackdrop || loading) return;
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
          restoreFocus();
        }
      }}
    >
      <div className="px-5 py-5">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description ? (
          <p id="confirm-dialog-description" className="mt-2 text-sm text-muted">
            {description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => {
              onClose();
              restoreFocus();
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? "danger" : "primary"}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
