"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function GestaoFiscalPage() {
  const { data: pessoal, isLoading: loadingPessoal } = useQuery({
    queryKey: ["gasto-pessoal"],
    queryFn: () => fetch("/api/rgf/gasto-pessoal").then((r) => r.json()),
  });

  const { data: divida, isLoading: loadingDivida } = useQuery({
    queryKey: ["divida"],
    queryFn: () => fetch("/api/rgf/divida").then((r) => r.json()),
  });

  const limiteLegal = 100;
  const limitePrudencial = 95;
  const limiteAlerta = 90;

  const ultimoPessoal = pessoal?.[pessoal?.length - 1];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Gestão Fiscal</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto com Pessoal (% RCL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPessoal ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {ultimoPessoal?.percentual?.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Último: {ultimoPessoal?.ano}/{ultimoPessoal?.periodo}º quadrimestre
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Limite Legal (LRF)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{limiteLegal}%</div>
            <p className="text-xs text-muted-foreground mt-1">Art. 20 da LRF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Limite Prudencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{limitePrudencial}%</div>
            <p className="text-xs text-muted-foreground mt-1">95% do limite legal</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Evolução do Gasto com Pessoal vs Limites</h3>
        {loadingPessoal ? (
          <div className="h-64 bg-muted rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={pessoal || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ano"
                tickFormatter={(v, i) => `${v}/${pessoal?.[i]?.periodo || ""}`}
              />
              <YAxis domain={[0, limiteLegal * 1.2]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Legend />
              <Line dataKey="percentual" stroke="#2563eb" strokeWidth={2} name="% RCL" dot />
              <Line
                dataKey={() => limiteLegal}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Limite Legal (100%)"
              />
              <Line
                dataKey={() => limitePrudencial}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Limite Prudencial (95%)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Dívida Consolidada</h3>
        {loadingDivida ? (
          <div className="h-64 bg-muted rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={divida?.filter((d: any) => d.cod_conta === "DIVIDA CONSOLIDADA - DC (I)") || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano" />
              <YAxis tickFormatter={(v) => `R$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={2} name="Dívida Consolidada" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
