"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { postJson } from "@/lib/client/fetch-json";

export function TopNavbar({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function onLogout() {
    setLoggingOut(true);
    await postJson("/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div>
              <p className="font-display text-lg leading-none text-ink sm:text-xl">
                Lamsa Cosmetics
              </p>
              <p className="text-xs text-muted sm:text-sm">
                Welcome back, {name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge status="ACTIVE">ADMIN</Badge>
            <Dropdown
              aria-label="Account menu"
              trigger={
                <>
                  <Avatar src={avatarUrl} alt={name} name={name} size="sm" />
                  <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink sm:inline">
                    {name}
                  </span>
                </>
              }
              items={[
                {
                  id: "email",
                  label: (
                    <span className="block max-w-[14rem]">
                      <span className="block font-medium text-ink">{name}</span>
                      <span className="block truncate text-xs text-muted">
                        {email}
                      </span>
                    </span>
                  ),
                  disabled: true,
                },
                {
                  id: "logout",
                  label: loggingOut ? "Logging out…" : "Logout",
                  destructive: true,
                  disabled: loggingOut,
                  onSelect: () => {
                    void onLogout();
                  },
                },
              ]}
            />
          </div>
        </div>
      </header>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
