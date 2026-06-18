import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const receitaTotal = await prisma.fato_receita.aggregate({
    _sum: { valor: true },
    where: { coluna: { codigo: { contains: "No Bimestre" } } },
  });

  const despesaTotal = await prisma.fato_despesa.aggregate({
    _sum: { valor: true },
    where: { coluna: { codigo: { contains: "DESPESAS LIQUIDADAS NO BIMESTRE" } } },
  });

  const receitaPrevista = await prisma.fato_receita.aggregate({
    _sum: { valor: true },
    where: { coluna: { codigo: "PREVISÃO INICIAL" } },
  });

  const populacao = await prisma.dim_municipio.findFirst({
    where: { cod_ibge: 3550100 },
    select: { ente: true },
  });

  const insights = [];

  // Receita aumentou/diminuiu
  const receitaPorAno = await prisma.fato_receita.groupBy({
    by: ["bimestre"],
    where: { coluna: { codigo: { contains: "No Bimestre" } } },
    _sum: { valor: true },
    orderBy: { bimestre: "asc" },
  });

  const totalReceita = receitaPorAno.reduce((s, r) => s + (r._sum.valor || 0), 0);
  const totalDespesa = despesaTotal._sum.valor || 0;

  const superavit = totalReceita - totalDespesa;
  if (superavit > 0) {
    insights.push(`O município apresentou superávit de R$ ${superavit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} no período.`);
  } else {
    insights.push(`O município apresentou déficit de R$ ${Math.abs(superavit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} no período.`);
  }

  // Gasto com pessoal
  const gastoPessoal = await prisma.fato_rgf.findFirst({
    where: { conta: { cod_conta: "DespesaComPessoalBruta" } },
    orderBy: { id: "desc" },
    include: { tempo: true },
  });

  if (gastoPessoal) {
    insights.push(`O gasto com pessoal no ${gastoPessoal.tempo.ano} foi de R$ ${gastoPessoal.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`);
  }

  return NextResponse.json({
    receita_total: totalReceita,
    despesa_total: totalDespesa,
    receita_prevista: receitaPrevista._sum.valor || 0,
    superavit,
    insights,
    municipio: populacao?.ente || "São Manuel",
  });
}
