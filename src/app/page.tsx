"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  BarChart3, Landmark, TrendingUp, Lightbulb,
  ArrowRight, Building2, Wallet, PiggyBank,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";

function formatBRL(val: number | string) {
  const num = typeof val === "number" ? val : Number(val);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dashboards = [
  { title: "Executivo", description: "Receitas, despesas e superávit", icon: BarChart3, href: "/executivo", color: "text-blue-500" },
  { title: "Gestão Fiscal", description: "Pessoal, dívida e limites LRF", icon: Landmark, href: "/gestao-fiscal", color: "text-amber-500" },
  { title: "Patrimônio", description: "Ativo, passivo e evolução", icon: TrendingUp, href: "/patrimonio", color: "text-emerald-500" },
  { title: "Insights", description: "Análises automáticas da saúde fiscal", icon: Lightbulb, href: "/insights", color: "text-violet-500" },
];

function HealthScoreCard({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500";
  const label = score >= 70 ? "Saudável" : score >= 40 ? "Atenção" : "Crítico";
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-card p-6 ring-1 ring-border">
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Saúde Fiscal
      </span>
      <span className={`text-5xl font-bold tabular-nums mt-1 ${color}`}>
        {score}
      </span>
      <span className="text-sm text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

export default function Home() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => fetch("/api/insights").then((r) => r.json()),
  });

  const { data: receitaDespesa } = useQuery({
    queryKey: ["receita-despesa-home"],
    queryFn: () => fetch("/api/graficos/receita-despesa").then((r) => r.json()),
  });

  const totalReceita = insights?.receita_total || 0;
  const totalDespesa = insights?.despesa_total || 0;
  const superavit = insights?.superavit || 0;
  const healthScore = totalReceita > 0
    ? Math.round(Math.min(100, ((totalReceita - totalDespesa) / totalReceita) * 50 + 50))
    : 50;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">GovInsight</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Análise fiscal municipal — São Manuel, SP
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <HealthScoreCard score={healthScore} />
        </div>
        <MetricCard
          title="Receita Total"
          value={formatBRL(totalReceita)}
          health={superavit > 0 ? "positive" : "negative"}
          loading={isLoading}
          icon={<Wallet className="size-3.5" />}
        />
        <MetricCard
          title="Despesa Total"
          value={formatBRL(totalDespesa)}
          health={superavit > 0 ? "neutral" : "negative"}
          loading={isLoading}
          icon={<PiggyBank className="size-3.5" />}
        />
        <MetricCard
          title="Resultado"
          value={formatBRL(superavit)}
          health={superavit > 0 ? "positive" : "negative"}
          trend={{
            value: totalReceita > 0 ? Math.round((superavit / totalReceita) * 100) : 0,
            direction: superavit > 0 ? "up" : "down",
          }}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Receita vs Despesa"
            subtitle="Por bimestre"
            loading={isLoading}
            height={240}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaDespesa || []} barGap={4}>
                <XAxis
                  dataKey="bimestre"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `R$${(Number(v) / 1e6).toFixed(0)}M`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => formatBRL(value as number)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} name="Receita" />
                <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="space-y-3">
          <SectionHeader title="Dashboards" subtitle="Acesse as análises" />
          {dashboards.map((d) => {
            const Icon = d.icon;
            return (
              <Link
                key={d.href}
                href={d.href}
                className="group flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-border transition-all hover:ring-muted-foreground/30"
              >
                <Icon className={`size-4 shrink-0 ${d.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.description}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {insights?.insights?.length > 0 && (
        <div>
          <SectionHeader title="Insights rápidos" subtitle="Com base nos dados mais recentes" className="mb-3" />
          <div className="space-y-2">
            {insights.insights.slice(0, 2).map((text: string, i: number) => (
              <div key={i} className="rounded-xl bg-card p-3 ring-1 ring-border text-sm text-foreground">
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
        Dados: SICONFI · Secretaria do Tesouro Nacional
      </footer>
    </div>
  );
}
