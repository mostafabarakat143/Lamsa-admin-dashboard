"use client";

import { useState, type FormEvent } from "react";

import { MenuSelect } from "@/components/ui/select";
import type { AdminUser } from "@/types/api";

export type UserEditFormValues = {
  role: AdminUser["role"];
  status: AdminUser["status"];
};

export type UserEditFormProps = {
  formId: string;
  initial: AdminUser;
  onSubmit: (values: UserEditFormValues) => Promise<void>;
  disabled?: boolean;
};

export function UserEditForm({
  formId,
  initial,
  onSubmit,
  disabled = false,
}: UserEditFormProps) {
  const [role, setRole] = useState<AdminUser["role"]>(initial.role);
  const [status, setStatus] = useState<AdminUser["status"]>(initial.status);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      await onSubmit({ role, status });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not update user.",
      );
    }
  }

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
      {formError ? (
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {formError}
        </p>
      ) : null}

      <MenuSelect
        label="Role"
        value={role}
        disabled={disabled}
        onValueChange={(value) => setRole(value as AdminUser["role"])}
        options={[
          { value: "CUSTOMER", label: "Customer" },
          { value: "ADMIN", label: "Admin" },
        ]}
      />

      <MenuSelect
        label="Status"
        value={status}
        disabled={disabled}
        onValueChange={(value) => setStatus(value as AdminUser["status"])}
        options={[
          { value: "ACTIVE", label: "Active" },
          { value: "DISABLED", label: "Disabled" },
        ]}
      />
    </form>
  );
}
