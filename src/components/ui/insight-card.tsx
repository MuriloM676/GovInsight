"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, BarChart3, Lightbulb } from "lucide-react";
import { HealthIndicator } from "./health-indicator";
import { Button } from "./button";

const categoryConfig = {
  receita: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  despesa: { icon: TrendingDown, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  alerta: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  divida: { icon: DollarSign, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  fiscal: { icon: BarChart3, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  geral: { icon: Lightbulb, color: "text-muted-foreground", bg: "bg-muted" },
};

type InsightCategory = keyof typeof categoryConfig;

interface InsightCardProps {
  text: string;
  category?: InsightCategory;
  priority?: "high" | "medium" | "low";
  impact?: string;
  recommendation?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function InsightCard({
  text,
  category = "geral",
  priority,
  impact,
  recommendation,
  actionLabel,
  onAction,
  className,
}: InsightCardProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group rounded-xl bg-card p-4 ring-1 ring-border transition-all hover:ring-muted-foreground/20",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", config.bg)}>
          <Icon className={cn("size-4", config.color)} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-relaxed text-foreground">{text}</p>
          <div className="flex flex-wrap items-center gap-2">
            {priority && (
              <HealthIndicator
                status={priority === "high" ? "negative" : priority === "medium" ? "warning" : "neutral"}
                label={priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"}
                size="sm"
              />
            )}
            {impact && (
              <span className="text-xs text-muted-foreground">
                Impacto: {impact}
              </span>
            )}
          </div>
          {recommendation && (
            <p className="text-xs text-muted-foreground italic">
              {recommendation}
            </p>
          )}
          {actionLabel && onAction && (
            <Button variant="secondary" size="xs" className="mt-1" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
