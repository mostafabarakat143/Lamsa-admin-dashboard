import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { UserDetailClient } from "@/components/users/user-detail-client";
import { parseAdminUser } from "@/lib/api/parsers";
import { bearerInit, callExpress } from "@/lib/auth/express";
import { requireAdmin } from "@/lib/auth/session";
type PageProps = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `User #${id}` };
}

export default async function UserDetailPage({ params }: PageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const result = await callExpress(
    `/api/v1/users/${id}`,
    bearerInit(admin.token, "GET"),
  );

  if (result.kind === "error" && result.status === 404) {
    notFound();
  }

  if (result.kind !== "ok") {
    const message =
      result.kind === "error" ? result.message : "API unavailable.";
    return (
      <div className="space-y-6">
        <Link
          href="/users"
          className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink transition-colors hover:bg-blush"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to users
        </Link>
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {message}
        </p>
      </div>
    );
  }

  const raw = isRecord(result.data)
    ? (result.data.user ?? result.data)
    : null;
  const user = raw ? parseAdminUser(raw) : null;

  if (!user) {
    return (
      <div className="space-y-6">
        <Link
          href="/users"
          className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink transition-colors hover:bg-blush"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to users
        </Link>
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          Unexpected user response.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/users"
            className="-ml-2 mb-3 inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink transition-colors hover:bg-blush"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to users
          </Link>
          <h1 className="font-display text-3xl text-ink">{user.email}</h1>
          <p className="mt-1 text-sm text-muted">
            User #{user.id} ·{" "}
            {new Date(user.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <UserDetailClient user={user} />
    </div>
  );
}
