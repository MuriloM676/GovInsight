"use client";

import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nenhum dado disponível",
  description = "Não encontramos dados para esta visualização. Verifique se há registros no período selecionado.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 p-12 text-center",
        className,
      )}
    >
      <div className="text-muted-foreground/50">
        {icon || <Inbox className="size-10" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
