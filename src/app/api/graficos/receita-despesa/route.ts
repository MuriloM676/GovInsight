import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const receitas = await prisma.fato_receita.groupBy({
    by: ["bimestre"],
    where: { coluna: { codigo: { contains: "No Bimestre" } } },
    _sum: { valor: true },
    orderBy: { bimestre: "asc" },
  });

  const despesas = await prisma.fato_despesa.groupBy({
    by: ["bimestre"],
    where: { coluna: { codigo: { contains: "DESPESAS LIQUIDADAS NO BIMESTRE" } } },
    _sum: { valor: true },
    orderBy: { bimestre: "asc" },
  });

  const data = receitas.map((r) => ({
    bimestre: r.bimestre,
    receita: r._sum.valor || 0,
    despesa: despesas.find((d) => d.bimestre === r.bimestre)?._sum.valor || 0,
  }));

  return NextResponse.json(data);
}
