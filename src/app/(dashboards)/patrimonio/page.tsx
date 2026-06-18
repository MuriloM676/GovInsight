"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";
import { KpiCard } from "@/components/dashboards/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PatrimonioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["patrimonio"],
    queryFn: () => fetch("/api/patrimonio/evolucao").then((r) => r.json()),
  });

  const ultimo = data?.[data?.length - 1];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Patrimônio Municipal</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Ativo Total" value={formatBRL(ultimo?.ativo || 0)} loading={isLoading} />
        <KpiCard title="Passivo Total" value={formatBRL(ultimo?.passivo || 0)} loading={isLoading} />
        <KpiCard title="Patrimônio Líquido" value={formatBRL(ultimo?.patrimonio_liquido || 0)} loading={isLoading} />
        <KpiCard title="Caixa" value={formatBRL(ultimo?.caixa || 0)} loading={isLoading} />
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Evolução Patrimonial</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" />
            <YAxis tickFormatter={(v) => `R$${(v / 1e6).toFixed(0)}M`} />
            <Tooltip formatter={(v: number) => formatBRL(v)} />
            <Legend />
            <Area type="monotone" dataKey="ativo" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} name="Ativo" />
            <Area type="monotone" dataKey="passivo" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Passivo" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Patrimônio Líquido e Caixa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" />
            <YAxis tickFormatter={(v) => `R$${(v / 1e6).toFixed(0)}M`} />
            <Tooltip formatter={(v: number) => formatBRL(v)} />
            <Legend />
            <Line type="monotone" dataKey="patrimonio_liquido" stroke="#10b981" strokeWidth={2} name="Patrimônio Líquido" />
            <Line type="monotone" dataKey="caixa" stroke="#f59e0b" strokeWidth={2} name="Caixa" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
