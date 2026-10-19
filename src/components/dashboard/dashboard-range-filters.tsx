"use client";

import { Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ManagementDialog } from "@/components/modals/management-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

function toDateInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function fromDateInput(value: string, endOfDay: boolean): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const parsed = new Date(`${trimmed}${suffix}`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

type Draft = {
  from: string;
  to: string;
  bucket: "month" | "day";
};

function draftFromProps(
  from: string | undefined,
  to: string | undefined,
  bucket: "month" | "day",
): Draft {
  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
    bucket,
  };
}

export function DashboardRangeFilters({
  from,
  to,
  bucket,
}: {
  from?: string;
  to?: string;
  bucket: "month" | "day";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() =>
    draftFromProps(from, to, bucket),
  );

  const activeCount = useMemo(() => {
    let count = 0;
    if (searchParams.get("from")) count += 1;
    if (searchParams.get("to")) count += 1;
    if (searchParams.get("bucket") === "day") count += 1;
    return count;
  }, [searchParams]);

  function openFilters() {
    setDraft(draftFromProps(from, to, bucket));
    setOpen(true);
  }

  function applyFilters(nextDraft: Draft) {
    const next = new URLSearchParams();
    const fromIso = fromDateInput(nextDraft.from, false);
    const toIso = fromDateInput(nextDraft.to, true);

    if (fromIso) next.set("from", fromIso);
    if (toIso) next.set("to", toIso);
    if (nextDraft.bucket === "day") {
      next.set("bucket", "day");
    }

    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
    setOpen(false);
  }

  function clearAndApply() {
    setDraft({ from: "", to: "", bucket: "month" });
    startTransition(() => {
      router.push(pathname);
    });
    setOpen(false);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 bg-surface"
          leftIcon={<Filter className="size-4" aria-hidden />}
          onClick={openFilters}
          aria-label={
            activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"
          }
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>

      <ManagementDialog
        open={open}
        onClose={() => setOpen(false)}
        mode="filter"
        title="Filter chart range"
        hideModeLabel
        className="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={clearAndApply}
            >
              Clear all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              loading={pending}
              onClick={() => applyFilters(draft)}
            >
              Apply
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="From (UTC day)"
            type="date"
            value={draft.from}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                from: event.target.value,
              }))
            }
          />
          <Input
            label="To (UTC day)"
            type="date"
            value={draft.to}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                to: event.target.value,
              }))
            }
          />
          <Select
            label="Bucket"
            value={draft.bucket}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                bucket: event.target.value === "day" ? "day" : "month",
              }))
            }
          >
            <option value="month">Month (YYYY-MM)</option>
            <option value="day">Day (YYYY-MM-DD)</option>
          </Select>
        </div>
      </ManagementDialog>
    </>
  );
}
