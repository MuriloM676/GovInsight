import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");

  const where: any = {};
  if (ano) { where.tempo = { ano: parseInt(ano) }; }

  const results = await prisma.fato_receita.groupBy({
    by: ["bimestre"],
    where: {
      ...where,
      coluna: { codigo: { contains: "PREVISÃO INICIAL" } },
    },
    _sum: { valor: true },
    orderBy: { bimestre: "asc" },
  });

  const receitaPrevista = results.map((r) => ({
    bimestre: r.bimestre,
    valor: r._sum.valor || 0,
  }));

  const resultados = await prisma.fato_receita.groupBy({
    by: ["bimestre"],
    where: {
      ...where,
      coluna: { codigo: { contains: "No Bimestre" } },
    },
    _sum: { valor: true },
    orderBy: { bimestre: "asc" },
  });

  const receitaArrecadada = resultados.map((r) => ({
    bimestre: r.bimestre,
    valor: r._sum.valor || 0,
  }));

  return NextResponse.json({ receitaPrevista, receitaArrecadada });
}
