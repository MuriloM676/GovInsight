"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { SectionHeader } from "@/components/ui/section-header";
import { InsightCard } from "@/components/ui/insight-card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, Legend,
} from "recharts";

function formatBRL(val: number | string) {
  const num = typeof val === "number" ? val : Number(val);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ExecutivoPage() {
  const insightsQuery = useQuery({
    queryKey: ["insights"],
    queryFn: () => fetch("/api/insights").then((r) => r.json()),
  });

  const receitaQuery = useQuery({
    queryKey: ["receita-ano"],
    queryFn: () => fetch("/api/graficos/receita-ano").then((r) => r.json()),
  });

  const despesaQuery = useQuery({
    queryKey: ["despesa-funcao"],
    queryFn: () => fetch("/api/graficos/despesa-funcao").then((r) => r.json()),
  });

  const rdQuery = useQuery({
    queryKey: ["receita-despesa"],
    queryFn: () => fetch("/api/graficos/receita-despesa").then((r) => r.json()),
  });

  const isLoading =
    insightsQuery.isLoading || receitaQuery.isLoading || despesaQuery.isLoading || rdQuery.isLoading;
  const hasError =
    insightsQuery.isError || receitaQuery.isError || despesaQuery.isError || rdQuery.isError;
  const data = insightsQuery.data;

  if (hasError) {
    return (
      <ErrorState
        onRetry={() => {
          insightsQuery.refetch();
          receitaQuery.refetch();
          despesaQuery.refetch();
          rdQuery.refetch();
        }}
      />
    );
  }

  if (isLoading) return <LoadingState variant="page" />;

  const totalReceita = data?.receita_total || 0;
  const totalDespesa = data?.despesa_total || 0;
  const superavit = data?.superavit || 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard Executivo"
        subtitle={data?.municipio || "São Manuel, SP"}
      />

      {data?.insights?.length > 0 && (
        <div className="space-y-2">
          {data.insights.map((text: string, i: number) => (
            <InsightCard
              key={i}
              text={text}
              category={text.includes("superávit") ? "receita" : text.includes("déficit") ? "despesa" : "geral"}
              priority={text.includes("déficit") ? "high" : "medium"}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Total"
          value={formatBRL(totalReceita)}
          health="positive"
        />
        <MetricCard
          title="Despesa Total"
          value={formatBRL(totalDespesa)}
          health="neutral"
        />
        <MetricCard
          title="Superávit / Déficit"
          value={formatBRL(superavit)}
          health={superavit > 0 ? "positive" : "negative"}
          subtitle={superavit > 0 ? "Superávit no período" : "Déficit no período"}
          trend={{
            value: totalReceita > 0 ? Math.round((Math.abs(superavit) / totalReceita) * 100) : 0,
            direction: superavit > 0 ? "up" : "down",
          }}
        />
        <MetricCard
          title="Receita Prevista"
          value={formatBRL(data?.receita_prevista || 0)}
          health="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Receita por Bimestre"
          subtitle="Valores arrecadados"
          loading={receitaQuery.isLoading}
          height={280}
        >
          {receitaQuery.data?.receitaArrecadada?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaQuery.data.receitaArrecadada}>
                <XAxis dataKey="bimestre" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `R$${(Number(v) / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => formatBRL(value as number)}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                />
                <Bar dataKey="valor" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={40} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem dados de receita" />
          )}
        </ChartCard>

        <ChartCard
          title="Despesa por Função"
          subtitle="Principais funções orçamentárias"
          loading={despesaQuery.isLoading}
          height={280}
        >
          {despesaQuery.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={despesaQuery.data.slice(0, 8)} layout="vertical" barGap={2}>
                <XAxis type="number" tickFormatter={(v) => `R$${(Number(v) / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="funcao" type="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip
                  formatter={(value) => formatBRL(value as number)}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                />
                <Bar dataKey="valor" fill="var(--chart-2)" radius={[0, 4, 4, 0]} maxBarSize={20} name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem dados de despesa" />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Receita vs Despesa"
        subtitle="Comparativo bimestral"
        loading={rdQuery.isLoading}
        height={300}
      >
        {rdQuery.data?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rdQuery.data}>
              <XAxis dataKey="bimestre" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `R$${(Number(v) / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => formatBRL(value as number)}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} dot={false} name="Receita" />
              <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} dot={false} name="Despesa" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState title="Sem dados comparativos" />
        )}
      </ChartCard>
    </div>
  );
}
