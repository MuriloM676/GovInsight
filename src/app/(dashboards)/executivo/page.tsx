"use client";

import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/dashboards/kpi-card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ExecutivoPage() {
  const { data: insights, isLoading: loadingInsights } = useQuery({
    queryKey: ["insights"],
    queryFn: () => fetch("/api/insights").then((r) => r.json()),
  });

  const { data: receitaAno, isLoading: loadingReceita } = useQuery({
    queryKey: ["receita-ano"],
    queryFn: () => fetch("/api/graficos/receita-ano").then((r) => r.json()),
  });

  const { data: despesaFuncao, isLoading: loadingDespesa } = useQuery({
    queryKey: ["despesa-funcao"],
    queryFn: () => fetch("/api/graficos/despesa-funcao").then((r) => r.json()),
  });

  const { data: receitaDespesa, isLoading: loadingRD } = useQuery({
    queryKey: ["receita-despesa"],
    queryFn: () => fetch("/api/graficos/receita-despesa").then((r) => r.json()),
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
        <p className="text-muted-foreground">
          {insights?.municipio || "Carregando..."}
        </p>
      </div>

      {insights?.insights && (
        <div className="bg-muted rounded-lg p-4 space-y-1">
          {insights.insights.map((text: string, i: number) => (
            <p key={i} className="text-sm">{text}</p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Receita Total"
          value={formatBRL(insights?.receita_total || 0)}
          loading={loadingInsights}
        />
        <KpiCard
          title="Despesa Total"
          value={formatBRL(insights?.despesa_total || 0)}
          loading={loadingInsights}
        />
        <KpiCard
          title="Superávit / Déficit"
          value={formatBRL(insights?.superavit || 0)}
          subtitle={insights?.superavit > 0 ? "Superávit no período" : "Déficit no período"}
          loading={loadingInsights}
        />
        <KpiCard
          title="Receita Prevista"
          value={formatBRL(insights?.receita_prevista || 0)}
          loading={loadingInsights}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Receita por Bimestre</h3>
          {loadingReceita ? (
            <div className="h-64 bg-muted rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receitaAno?.receitaArrecadada || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bimestre" />
                <YAxis tickFormatter={(v) => `R$${(v / 1e6).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Despesa por Função</h3>
          {loadingDespesa ? (
            <div className="h-64 bg-muted rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={despesaFuncao?.slice(0, 8) || []}
                  dataKey="valor"
                  nameKey="funcao"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ funcao }) => funcao.slice(0, 20)}
                >
                  {(despesaFuncao?.slice(0, 8) || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Receita x Despesa por Bimestre</h3>
        {loadingRD ? (
          <div className="h-64 bg-muted rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={receitaDespesa || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bimestre" />
              <YAxis tickFormatter={(v) => `R$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Legend />
              <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} name="Receita" />
              <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} name="Despesa" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
