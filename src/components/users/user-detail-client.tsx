"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  UserEditForm,
  type UserEditFormValues,
} from "@/components/users/user-edit-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { patchJson } from "@/lib/client/fetch-json";
import type { AdminUser } from "@/types/api";

export type UserDetailClientProps = {
  user: AdminUser;
};

const EDIT_FORM_ID = "user-detail-edit-form";

function displayName(user: AdminUser): string {
  const first = user.profile?.firstName?.trim();
  const last = user.profile?.lastName?.trim();
  const combined = [first, last].filter(Boolean).join(" ");
  return combined || user.email;
}

export function UserDetailClient({ user }: UserDetailClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  async function saveUser(values: UserEditFormValues) {
    setSaving(true);
    setSaveMessage(null);
    const result = await patchJson(`/api/users/${user.id}`, values);
    setSaving(false);
    if (!result.ok) {
      throw new Error(
        result.status === 409
          ? "The last active admin cannot be disabled or demoted."
          : result.message,
      );
    }
    setSaveMessage("User updated.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 border-none pb-0">
          <Avatar
            size="lg"
            src={user.profile?.avatarUrl}
            alt={displayName(user)}
            name={displayName(user)}
          />
          <div>
            <CardTitle>{displayName(user)}</CardTitle>
            <p className="text-sm text-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge status={user.role}>{user.role}</Badge>
              <Badge status={user.status} />
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted">First name</dt>
              <dd className="text-ink">{user.profile?.firstName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Last name</dt>
              <dd className="text-ink">{user.profile?.lastName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="text-ink">{user.profile?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Updated</dt>
              <dd className="text-ink">
                {new Date(user.updatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role &amp; status</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {saveMessage ? (
            <p className="rounded-lg border border-rose/25 bg-blush/50 px-3 py-2 text-sm text-ink">
              {saveMessage}
            </p>
          ) : null}
          <UserEditForm
            key={`${user.id}-${user.role}-${user.status}`}
            formId={EDIT_FORM_ID}
            initial={user}
            disabled={saving}
            onSubmit={saveUser}
          />
          <Button
            type="submit"
            form={EDIT_FORM_ID}
            size="sm"
            loading={saving}
            className="w-full sm:w-auto"
          >
            Save changes
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
