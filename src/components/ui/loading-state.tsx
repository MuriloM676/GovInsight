"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LoadingStateProps {
  variant?: "card" | "list" | "chart" | "page";
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = "card",
  count = 1,
  className,
}: LoadingStateProps) {
  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-border">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("rounded-xl bg-card p-4 ring-1 ring-border", className)}>
        <Skeleton className="h-3.5 w-32 mb-4" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card p-4 ring-1 ring-border">
              <Skeleton className="h-3.5 w-20 mb-3" />
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count || 3 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card p-4 ring-1 ring-border">
          <Skeleton className="h-3.5 w-20 mb-3" />
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
