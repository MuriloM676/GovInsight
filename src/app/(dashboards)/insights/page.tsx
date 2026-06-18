"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { InsightCard } from "@/components/ui/insight-card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

function formatBRL(val: number | string) {
  const num = typeof val === "number" ? val : Number(val);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function categorizeInsight(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("superávit") || lower.includes("superavit")) return "receita";
  if (lower.includes("déficit") || lower.includes("deficit")) return "despesa";
  if (lower.includes("alerta") || lower.includes("limite")) return "alerta";
  if (lower.includes("dívida") || lower.includes("divida")) return "divida";
  if (lower.includes("pessoal") || lower.includes("lrf")) return "fiscal";
  return "geral";
}

function getPriority(text: string): "high" | "medium" | "low" {
  const lower = text.toLowerCase();
  if (lower.includes("déficit") || lower.includes("acima") || lower.includes("excedeu")) return "high";
  if (lower.includes("superávit") || lower.includes("cresceu") || lower.includes("aumentou")) return "medium";
  return "low";
}

export default function InsightsPage() {
  const query = useQuery({
    queryKey: ["insights"],
    queryFn: () => fetch("/api/insights").then((r) => r.json()),
  });

  if (query.isError) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  if (query.isLoading) return <LoadingState variant="page" />;

  const data = query.data;
  const insights = data?.insights || [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Insights Inteligentes"
        subtitle="Análises automáticas baseadas nos dados fiscais de São Manuel"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Receita Total"
          value={formatBRL(data?.receita_total || 0)}
          health="positive"
        />
        <MetricCard
          title="Despesa Total"
          value={formatBRL(data?.despesa_total || 0)}
          health="neutral"
        />
        <MetricCard
          title="Resultado"
          value={formatBRL(data?.superavit || 0)}
          health={(data?.superavit || 0) >= 0 ? "positive" : "negative"}
        />
      </div>

      <div>
        <SectionHeader
          title="Análises Geradas"
          subtitle={`${insights.length} insight${insights.length !== 1 ? "s" : ""} encontrado${insights.length !== 1 ? "s" : ""}`}
          className="mb-3"
        />
        {insights.length > 0 ? (
          <div className="space-y-2">
            {insights.map((text: string, i: number) => (
              <InsightCard
                key={i}
                text={text}
                category={categorizeInsight(text) as any}
                priority={getPriority(text)}
                impact={
                  getPriority(text) === "high"
                    ? "Requer atenção imediata"
                    : getPriority(text) === "medium"
                    ? "Monitoramento recomendado"
                    : "Informativo"
                }
                recommendation={
                  text.includes("déficit")
                    ? "Avalie a necessidade de contingenciamento de despesas."
                    : text.includes("superávit")
                    ? "Considere direcionar o superávit para investimentos ou reservas."
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum insight disponível"
            description="Não foram geradas análises automáticas para o período atual. Verifique se há dados carregados."
          />
        )}
      </div>
    </div>
  );
}
