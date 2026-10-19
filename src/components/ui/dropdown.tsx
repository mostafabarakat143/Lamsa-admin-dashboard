"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type DropdownItem = {
  id: string;
  label: ReactNode;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
};

export type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
  menuClassName?: string;
  "aria-label"?: string;
};

export function Dropdown({
  trigger,
  items,
  align = "end",
  className,
  menuClassName,
  "aria-label": ariaLabel = "Account menu",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className={cn("relative inline-block text-left", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={ariaLabel}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/30"
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
        <ChevronDown
          className={cn("size-4 text-muted transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-50 mt-2 min-w-[12rem] rounded-lg border border-line bg-surface py-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {items.map((item) => {
            const itemClass = cn(
              "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
              item.disabled
                ? "cursor-not-allowed text-muted opacity-50"
                : item.destructive
                  ? "text-rose-deep hover:bg-blush"
                  : "text-ink hover:bg-blush",
            );

            if (item.href && !item.disabled) {
              return (
                <a
                  key={item.id}
                  role="menuitem"
                  href={item.href}
                  className={itemClass}
                  onClick={() => {
                    item.onSelect?.();
                    close();
                  }}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={itemClass}
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect?.();
                  close();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
