"use client";

import { Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ManagementDialog } from "@/components/modals/management-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type FilterOption = { value: string; label: string };

export type TableToolbarProps = {
  searchKey?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: FilterOption[];
  }>;
};

function draftFromParams(
  searchParams: URLSearchParams,
  searchKey: string,
  filters: TableToolbarProps["filters"],
): Record<string, string> {
  const draft: Record<string, string> = {
    [searchKey]: searchParams.get(searchKey) ?? "",
  };
  for (const filter of filters ?? []) {
    draft[filter.key] =
      searchParams.get(filter.key) ?? filter.options[0]?.value ?? "";
  }
  return draft;
}

function countActiveFilters(
  searchParams: URLSearchParams,
  searchKey: string,
  filters: TableToolbarProps["filters"],
): number {
  let count = 0;
  const search = searchParams.get(searchKey)?.trim();
  if (search) count += 1;

  for (const filter of filters ?? []) {
    const current = searchParams.get(filter.key);
    const defaultValue = filter.options[0]?.value ?? "";
    if (current && current !== defaultValue) {
      count += 1;
    }
  }
  return count;
}

export function TableToolbar({
  searchKey = "search",
  searchPlaceholder = "Search…",
  searchLabel = "Search",
  filters = [],
}: TableToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() =>
    draftFromParams(searchParams, searchKey, filters),
  );

  const activeCount = useMemo(
    () => countActiveFilters(searchParams, searchKey, filters),
    [searchParams, searchKey, filters],
  );

  function openFilters() {
    setDraft(draftFromParams(searchParams, searchKey, filters));
    setOpen(true);
  }

  function applyFilters(nextDraft: Record<string, string>) {
    const next = new URLSearchParams();

    const searchValue = nextDraft[searchKey]?.trim();
    if (searchValue) {
      next.set(searchKey, searchValue);
    }

    for (const filter of filters) {
      const value = nextDraft[filter.key] ?? "";
      const defaultValue = filter.options[0]?.value ?? "";
      if (value && value !== defaultValue) {
        next.set(filter.key, value);
      } else if (value === defaultValue && defaultValue) {
        // Keep explicit default only when the page depends on it in the URL.
        // Prefer omitting defaults so Clear returns a clean path.
      }
    }

    // Preserve non-filter query keys (none currently beyond page).
    // Always reset pagination on filter apply.
    next.delete("page");

    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
    setOpen(false);
  }

  function clearAndApply() {
    const cleared: Record<string, string> = { [searchKey]: "" };
    for (const filter of filters) {
      cleared[filter.key] = filter.options[0]?.value ?? "";
    }
    setDraft(cleared);
    startTransition(() => {
      router.push(pathname);
    });
    setOpen(false);
  }

  return (
    <>
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

      <ManagementDialog
        open={open}
        onClose={() => setOpen(false)}
        mode="filter"
        title="Filter results"
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
            label={searchLabel}
            value={draft[searchKey] ?? ""}
            placeholder={searchPlaceholder}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                [searchKey]: event.target.value,
              }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyFilters({
                  ...draft,
                  [searchKey]: event.currentTarget.value,
                });
              }
            }}
          />

          {filters.map((filter) => (
            <Select
              key={filter.key}
              label={filter.label}
              value={draft[filter.key] ?? filter.options[0]?.value ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  [filter.key]: event.target.value,
                }))
              }
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ))}
        </div>
      </ManagementDialog>
    </>
  );
}
