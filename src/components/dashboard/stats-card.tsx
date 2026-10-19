import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export type StatsCardState = "ready" | "loading" | "error" | "unavailable";

export type StatsCardProps = {
  title: string;
  icon: LucideIcon;
  value?: string | number;
  state?: StatsCardState;
  errorMessage?: string;
  unavailableMessage?: string;
  className?: string;
};

export function StatsCard({
  title,
  icon: Icon,
  value,
  state = "ready",
  errorMessage = "Unable to load this metric.",
  unavailableMessage = "This metric is not available yet.",
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted">{title}</CardTitle>
        <span className="flex size-9 items-center justify-center rounded-lg bg-blush text-rose-deep">
          <Icon className="size-4" aria-hidden />
        </span>
      </CardHeader>
      <CardBody className="pt-0">
        {state === "loading" ? (
          <LoadingState compact label="Loading metric" className="py-4" />
        ) : state === "error" ? (
          <ErrorState
            title="Metric unavailable"
            message={errorMessage}
            className="border-none bg-transparent py-4"
          />
        ) : state === "unavailable" ? (
          <p className="text-sm text-muted">{unavailableMessage}</p>
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
        )}
      </CardBody>
    </Card>
  );
}
