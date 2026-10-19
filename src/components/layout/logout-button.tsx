"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/client/fetch-json";
import { cn } from "@/lib/utils/cn";

export function LogoutButton({
  className,
  fullWidth = false,
}: {
  className?: string;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    await postJson("/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={loading}
      onClick={() => void onLogout()}
      className={cn(fullWidth && "w-full justify-start", className)}
      leftIcon={<LogOut className="size-4" aria-hidden />}
    >
      Logout
    </Button>
  );
}
