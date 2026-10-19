"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";

import { TableToolbar } from "@/components/filters/table-toolbar";
import { ManagementDialog } from "@/components/modals/management-dialog";
import { DataTable } from "@/components/tables/data-table";
import {
  UserEditForm,
  type UserEditFormValues,
} from "@/components/users/user-edit-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { buildPageHref as buildHref } from "@/lib/api/query";
import { patchJson } from "@/lib/client/fetch-json";
import type { AdminUser, PageMeta } from "@/types/api";

export type UsersClientProps = {
  users: AdminUser[];
  meta: PageMeta | null;
  error: string | null;
  query: Record<string, string | undefined>;
};

const PATH = "/users";
const EDIT_FORM_ID = "user-edit-form";

function displayName(user: AdminUser): string {
  const first = user.profile?.firstName?.trim();
  const last = user.profile?.lastName?.trim();
  const combined = [first, last].filter(Boolean).join(" ");
  return combined || user.email;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function UsersClient({
  users,
  meta,
  error,
  query,
}: UsersClientProps) {
  const router = useRouter();
  const [viewTarget, setViewTarget] = useState<AdminUser | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const pageHref = (page: number) => buildHref(PATH, query, { page: String(page) });

  function openView(user: AdminUser) {
    setViewTarget(user);
  }

  function openEdit(user: AdminUser) {
    setActionError(null);
    setEditTarget(user);
  }

  function closeEdit() {
    if (saving) return;
    setEditTarget(null);
  }

  async function saveUser(values: UserEditFormValues) {
    if (!editTarget) return;
    setSaving(true);
    setActionError(null);
    const result = await patchJson(`/api/users/${editTarget.id}`, values);
    setSaving(false);
    if (!result.ok) {
      throw new Error(
        result.status === 409
          ? "The last active admin cannot be disabled or demoted."
          : result.message,
      );
    }
    setEditTarget(null);
    router.refresh();
  }

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted">{getValue<number>()}</span>
        ),
      },
      {
        id: "firstName",
        header: "First name",
        cell: ({ row }) => row.original.profile?.firstName ?? "—",
      },
      {
        id: "lastName",
        header: "Last name",
        cell: ({ row }) => row.original.profile?.lastName ?? "—",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex max-w-[12rem] items-center gap-2">
              <Avatar
                size="sm"
                src={user.profile?.avatarUrl}
                alt={displayName(user)}
                name={displayName(user)}
              />
              <span className="truncate" title={user.email}>
                {user.email}
              </span>
            </div>
          );
        },
      },
      {
        id: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.profile?.phone ?? "—",
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => <Badge status={row.original.role}>{row.original.role}</Badge>,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <Badge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                leftIcon={<Eye className="size-3.5" />}
                onClick={() => openView(user)}
              >
                View
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                leftIcon={<Pencil className="size-3.5" />}
                onClick={() => openEdit(user)}
              >
                Edit
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      {actionError && !editTarget ? (
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {actionError}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={users}
        meta={meta ?? undefined}
        error={error}
        buildPageHref={meta ? pageHref : undefined}
        emptyTitle="No users"
        emptyDescription="Try adjusting search or filters."
        toolbar={
          <Suspense fallback={<LoadingState label="Loading filters" compact />}>
            <TableToolbar
              searchPlaceholder="Search users…"
              filters={[
                {
                  key: "role",
                  label: "Role",
                  options: [
                    { value: "ALL", label: "All roles" },
                    { value: "CUSTOMER", label: "Customer" },
                    { value: "ADMIN", label: "Admin" },
                  ],
                },
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { value: "ALL", label: "All statuses" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "DISABLED", label: "Disabled" },
                  ],
                },
                {
                  key: "sortBy",
                  label: "Sort by",
                  options: [
                    { value: "email", label: "Email" },
                    { value: "createdAt", label: "Created" },
                    { value: "role", label: "Role" },
                    { value: "status", label: "Status" },
                  ],
                },
                {
                  key: "sortOrder",
                  label: "Order",
                  options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                  ],
                },
              ]}
            />
          </Suspense>
        }
      />

      <ManagementDialog
        open={viewTarget !== null}
        onClose={() => setViewTarget(null)}
        mode="view"
        title={viewTarget ? displayName(viewTarget) : "User"}
        className="max-w-lg"
      >
        {viewTarget ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Avatar
                size="lg"
                src={viewTarget.profile?.avatarUrl}
                alt={displayName(viewTarget)}
                name={displayName(viewTarget)}
              />
              <div className="min-w-0">
                <p className="font-medium text-ink">{displayName(viewTarget)}</p>
                <p className="truncate text-muted">{viewTarget.email}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-muted">Customer ID</dt>
                <dd className="font-mono text-ink">{viewTarget.id}</dd>
              </div>
              <div>
                <dt className="text-muted">Customer name</dt>
                <dd className="text-ink">{displayName(viewTarget)}</dd>
              </div>
              <div>
                <dt className="text-muted">Customer email</dt>
                <dd className="break-all text-ink">{viewTarget.email}</dd>
              </div>
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="text-ink">{viewTarget.profile?.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Role</dt>
                <dd>
                  <Badge status={viewTarget.role}>{viewTarget.role}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Status</dt>
                <dd>
                  <Badge status={viewTarget.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted">Created</dt>
                <dd className="text-ink">{formatDateTime(viewTarget.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Updated</dt>
                <dd className="text-ink">{formatDateTime(viewTarget.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </ManagementDialog>

      <ManagementDialog
        open={editTarget !== null}
        onClose={closeEdit}
        mode="edit"
        title={editTarget ? editTarget.email : "User"}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={closeEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={EDIT_FORM_ID}
              size="sm"
              loading={saving}
            >
              Save
            </Button>
          </>
        }
      >
        {editTarget ? (
          <UserEditForm
            key={editTarget.id}
            formId={EDIT_FORM_ID}
            initial={editTarget}
            disabled={saving}
            onSubmit={saveUser}
          />
        ) : null}
      </ManagementDialog>
    </div>
  );
}
