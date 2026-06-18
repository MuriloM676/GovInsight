"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  height?: number;
}

export function ChartCard({
  title,
  subtitle,
  action,
  loading,
  className,
  children,
  height,
}: ChartCardProps) {
  return (
    <div className={cn("flex flex-col rounded-xl bg-card ring-1 ring-border", className)}>
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-2 pt-0 flex-1 min-w-0">
        {loading ? (
          <div
            className="bg-muted/50 rounded-lg animate-pulse"
            style={{ height: height || 280 }}
          />
        ) : (
          <div style={{ height: height || 280, width: "100%", position: "relative" }} className="min-w-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
