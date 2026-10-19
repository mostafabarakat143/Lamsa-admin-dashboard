import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export type ChartContainerState =
  | "ready"
  | "loading"
  | "empty"
  | "unavailable"
  | "error";

export type ChartContainerProps = {
  title: string;
  description?: string;
  children: ReactNode;
  state?: ChartContainerState;
  emptyTitle?: string;
  emptyDescription?: string;
  unavailableMessage?: string;
  errorMessage?: string;
  className?: string;
  bodyClassName?: string;
};

export function ChartContainer({
  title,
  description,
  children,
  state = "ready",
  emptyTitle = "No data yet",
  emptyDescription,
  unavailableMessage = "This chart is not available yet.",
  errorMessage = "Unable to load chart data.",
  className,
  bodyClassName,
}: ChartContainerProps) {
  let content: ReactNode = children;

  if (state === "loading") {
    content = <LoadingState label="Loading chart" />;
  } else if (state === "empty") {
    content = (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="border-none bg-transparent"
      />
    );
  } else if (state === "unavailable") {
    content = (
      <p className="py-10 text-center text-sm text-muted">{unavailableMessage}</p>
    );
  } else if (state === "error") {
    content = (
      <ErrorState
        title="Chart error"
        message={errorMessage}
        className="border-none bg-transparent"
      />
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
      </CardHeader>
      <CardBody className={cn("min-h-[280px]", bodyClassName)}>{content}</CardBody>
    </Card>
  );
}
