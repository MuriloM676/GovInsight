import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const despBruta = await prisma.fato_rgf.findMany({
    where: { conta: { cod_conta: "DespesaComPessoalBruta" } },
    include: { tempo: true },
    orderBy: [{ tempo: { ano: "asc" } }, { periodo: "asc" }],
  });

  const rcl = await prisma.fato_rgf.findMany({
    where: { conta: { cod_conta: { contains: "RECEITA CORRENTE LIQUIDA" } } },
    include: { tempo: true },
    orderBy: [{ tempo: { ano: "asc" } }, { periodo: "asc" }],
  });

  const data = despBruta.map((d) => {
    const rclVal = rcl.find(
      (r) => r.tempo.ano === d.tempo.ano && r.periodo === d.periodo
    );
    return {
      ano: d.tempo.ano,
      periodo: d.periodo,
      despesa_pessoal: d.valor,
      rcl: rclVal?.valor || 0,
      percentual: rclVal?.valor ? (d.valor / rclVal.valor) * 100 : 0,
    };
  });

  return NextResponse.json(data);
}
