"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";

const iconMap = [Lightbulb, TrendingUp, TrendingDown, AlertTriangle, DollarSign];

export default function InsightsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => fetch("/api/insights").then((r) => r.json()),
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights Inteligentes</h1>
        <p className="text-muted-foreground">
          Análises automáticas baseadas nos dados fiscais
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-green-500">
                {data?.receita_total?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesa Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-red-500">
                {data?.despesa_total?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className={`text-2xl font-bold ${(data?.superavit || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                {data?.superavit?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Análises Geradas</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          data?.insights?.map((text: string, i: number) => {
            const Icon = iconMap[i % iconMap.length];
            return (
              <Card key={i} className="border-l-4 border-l-primary">
                <CardContent className="flex items-start gap-3 pt-4">
                  <Icon className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <p className="text-sm">{text}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
