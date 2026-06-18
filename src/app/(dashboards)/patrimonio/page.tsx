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

export default function PatrimonioPage() {
  const query = useQuery({
    queryKey: ["patrimonio"],
    queryFn: () => fetch("/api/patrimonio/evolucao").then((r) => r.json()),
  });

  if (query.isError) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  if (query.isLoading) return <LoadingState variant="page" />;

  const data = query.data || [];
  const ultimo = data[data.length - 1] || {};

  const patrimonioLiquido = ultimo?.patrimonio_liquido || 0;
  const ativo = ultimo?.ativo || 0;
  const passivo = ultimo?.passivo || 0;
  const caixa = ultimo?.caixa || 0;

  const plHealth = patrimonioLiquido > 0 ? "positive" : patrimonioLiquido < 0 ? "negative" : "neutral";
  const solvencia = passivo > 0 ? (ativo / passivo).toFixed(2) : "N/A";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Patrimônio Municipal"
        subtitle="Ativo, passivo, patrimônio líquido e evolução histórica"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ativo Total"
          value={formatBRL(ativo)}
          health="positive"
          subtitle={`Último: ${ultimo?.ano || "-"}`}
        />
        <MetricCard
          title="Passivo Total"
          value={formatBRL(passivo)}
          health={passivo > ativo ? "negative" : "neutral"}
          subtitle={`Último: ${ultimo?.ano || "-"}`}
        />
        <MetricCard
          title="Patrimônio Líquido"
          value={formatBRL(patrimonioLiquido)}
          health={plHealth}
          trend={{
            value: ativo > 0 ? Math.round((patrimonioLiquido / ativo) * 100) : 0,
            direction: patrimonioLiquido > 0 ? "up" : "down",
          }}
        />
        <MetricCard
          title="Caixa"
          value={formatBRL(caixa)}
          health={caixa > 0 ? "positive" : "warning"}
          subtitle={`Solvência: ${solvencia}x`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Evolução Patrimonial"
          subtitle="Ativo vs Passivo"
          loading={query.isLoading}
          height={300}
        >
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, bottom: 8 }}>
                <XAxis dataKey="ano" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(v: number) => `R$${(v / 1e6).toFixed(0)}M`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => formatBRL(value as number)}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
                <Area
                  type="monotone"
                  dataKey="ativo"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.08}
                  strokeWidth={2}
                  name="Ativo"
                />
                <Area
                  type="monotone"
                  dataKey="passivo"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.08}
                  strokeWidth={2}
                  name="Passivo"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem dados patrimoniais" />
          )}
        </ChartCard>

        <ChartCard
          title="Patrimônio Líquido e Caixa"
          subtitle="Evolução histórica"
          loading={query.isLoading}
          height={300}
        >
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, bottom: 8 }}>
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
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
                <Line
                  type="monotone"
                  dataKey="patrimonio_liquido"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Patrimônio Líquido"
                />
                <Line
                  type="monotone"
                  dataKey="caixa"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                  name="Caixa"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem dados de patrimônio" />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
