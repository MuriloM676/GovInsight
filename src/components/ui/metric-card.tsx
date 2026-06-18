"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { TrendBadge } from "./trend-badge";
import { HealthIndicator } from "./health-indicator";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; direction: "up" | "down" | "flat" };
  health?: "positive" | "warning" | "negative" | "neutral";
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  health,
  icon,
  loading,
  className,
  children,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-border", className)}>
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-border", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {health && <HealthIndicator status={health} />}
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </span>
        {trend && <TrendBadge value={trend.value} direction={trend.direction} />}
      </div>
      {subtitle && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}
      {children}
    </div>
  );
}
