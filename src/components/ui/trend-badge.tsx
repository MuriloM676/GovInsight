"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendBadgeProps {
  value: number;
  direction: "up" | "down" | "flat";
  className?: string;
}

export function TrendBadge({
  value,
  direction,
  className,
}: TrendBadgeProps) {
  const isUp = direction === "up";
  const isDown = direction === "down";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        isUp && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        isDown && "bg-red-500/10 text-red-600 dark:text-red-400",
        !isUp && !isDown && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {isUp ? (
        <TrendingUp className="size-3" />
      ) : isDown ? (
        <TrendingDown className="size-3" />
      ) : (
        <Minus className="size-3" />
      )}
      {value > 0 && "+"}{value}%
    </span>
  );
}
