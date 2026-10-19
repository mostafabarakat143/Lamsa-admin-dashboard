"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar";

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close navigation"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p id={titleId} className="font-display text-lg text-ink">
            Navigation
          </p>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-ink hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-deep/40"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SidebarNav onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
