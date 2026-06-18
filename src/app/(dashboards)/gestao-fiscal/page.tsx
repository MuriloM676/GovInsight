"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { SectionHeader } from "@/components/ui/section-header";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area,
} from "recharts";

function formatBRL(val: number | string) {
  const num = typeof val === "number" ? val : Number(val);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const limiteLegal = 100;
const limitePrudencial = 95;
const limiteAlerta = 90;

export default function GestaoFiscalPage() {
  const pessoalQuery = useQuery({
    queryKey: ["gasto-pessoal"],
    queryFn: () => fetch("/api/rgf/gasto-pessoal").then((r) => r.json()),
  });

  const dividaQuery = useQuery({
    queryKey: ["divida"],
    queryFn: () => fetch("/api/rgf/divida").then((r) => r.json()),
  });

  const isLoading = pessoalQuery.isLoading || dividaQuery.isLoading;
  const hasError = pessoalQuery.isError || dividaQuery.isError;

  if (hasError) {
    return (
      <ErrorState
        onRetry={() => {
          pessoalQuery.refetch();
          dividaQuery.refetch();
        }}
      />
    );
  }

  if (isLoading) return <LoadingState variant="page" />;

  const pessoal = pessoalQuery.data || [];
  const divida = dividaQuery.data || [];
  const ultimoPessoal = pessoal?.[pessoal?.length - 1];
  const percentual = ultimoPessoal?.percentual || 0;

  const pessoalHealth =
    percentual > limiteLegal ? "negative" :
    percentual > limitePrudencial ? "warning" : "positive";

  const dividaConsolidada = divida.filter(
    (d: any) => d.cod_conta === "DIVIDA CONSOLIDADA - DC (I)"
  );
  const ultimaDivida = dividaConsolidada?.[dividaConsolidada?.length - 1];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestão Fiscal"
        subtitle="Gasto com pessoal, limites da LRF e dívida consolidada"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gasto com Pessoal"
          value={`${percentual.toFixed(2)}%`}
          health={pessoalHealth}
          subtitle={`Último: ${ultimoPessoal?.ano || "-"}/${ultimoPessoal?.periodo || "-"}º quadrimestre`}
          trend={{
            value: percentual,
            direction: percentual > limiteAlerta ? "up" : percentual > limitePrudencial ? "up" : "down",
          }}
        />
        <MetricCard
          title="Limite Legal (LRF)"
          value={`${limiteLegal}%`}
          health="neutral"
          subtitle="Art. 20 da LRF"
        />
        <MetricCard
          title="Limite Prudencial"
          value={`${limitePrudencial}%`}
          health="warning"
          subtitle="95% do limite legal"
        />
        <MetricCard
          title="Dívida Consolidada"
          value={formatBRL(ultimaDivida?.valor || 0)}
          health="neutral"
          subtitle={ultimaDivida ? `Último: ${ultimaDivida.ano}` : undefined}
        />
      </div>

      <ChartCard
        title="Evolução do Gasto com Pessoal"
        subtitle="Percentual da Receita Corrente Líquida vs Limites Legais"
        loading={pessoalQuery.isLoading}
        height={320}
      >
        {pessoal.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pessoal} margin={{ top: 8, bottom: 8 }}>
              <XAxis
                dataKey="ano"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, limiteLegal * 1.2]}
                tickFormatter={(v) => `${Number(v)}%`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)}%`}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Line
                type="monotone"
                dataKey="percentual"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="% RCL"
              />
              <Line
                dataKey={() => limiteAlerta}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                name="Limite Alerta (90%)"
              />
              <Line
                dataKey={() => limitePrudencial}
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                name="Limite Prudencial (95%)"
              />
              <Line
                dataKey={() => limiteLegal}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                name="Limite Legal (100%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState title="Sem dados de gasto com pessoal" />
        )}
      </ChartCard>

      <ChartCard
        title="Dívida Consolidada"
        subtitle="Evolução histórica"
        loading={dividaQuery.isLoading}
        height={300}
      >
        {dividaConsolidada.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dividaConsolidada} margin={{ top: 8, bottom: 8 }}>
              <XAxis dataKey="ano" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(v) => `R$${(Number(v) / 1e6).toFixed(0)}M`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => formatBRL(value as number)}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.1}
                strokeWidth={2}
                name="Dívida Consolidada"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState title="Sem dados de dívida consolidada" />
        )}
      </ChartCard>
    </div>
  );
}
