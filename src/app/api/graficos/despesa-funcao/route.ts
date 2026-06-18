import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");

  const where: any = {};
  if (ano) { where.tempo = { ano: parseInt(ano) }; }

  const results = await prisma.fato_despesa.groupBy({
    by: ["conta_id"],
    where: {
      ...where,
      coluna: { codigo: "DOTAÇÃO ATUALIZADA (a)" },
      bimestre: 6,
    },
    _sum: { valor: true },
  });

  const contas = await prisma.dim_conta_rreo.findMany({
    where: { id: { in: results.map((r) => r.conta_id) }, tipo: "Despesa" },
  });

  const contaMap = new Map(contas.map((c) => [c.id, c.descricao]));

  const data = results
    .map((r) => ({
      funcao: contaMap.get(r.conta_id) || "Desconhecida",
      valor: r._sum.valor || 0,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 15);

  return NextResponse.json(data);
}
