"use client";

import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  status: "positive" | "warning" | "negative" | "neutral";
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

export function HealthIndicator({
  status,
  size = "sm",
  label,
  className,
}: HealthIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full",
          size === "sm" ? "size-2" : "size-2.5",
          status === "positive" && "bg-emerald-500",
          status === "warning" && "bg-amber-500",
          status === "negative" && "bg-red-500",
          status === "neutral" && "bg-muted-foreground",
        )}
      />
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </span>
  );
}
