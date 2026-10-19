"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/layout/logout-button";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils/cn";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onNavigate}
        >
          <Image
            src="/brand-logo.png"
            alt="Lamsa Cosmetics"
            width={48}
            height={50}
            className="h-12 w-auto"
            priority
          />
          <div>
            <p className="font-display text-xl leading-none text-ink">Lamsa</p>
            <p className="text-xs text-muted">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-deep/40",
                active
                  ? "bg-blush text-rose-deep"
                  : "text-ink hover:bg-blush/70",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <LogoutButton fullWidth />
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
      <SidebarNav />
    </aside>
  );
}
