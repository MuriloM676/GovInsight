import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const divida = await prisma.fato_rgf.findMany({
    where: { conta: { cod_conta: { contains: "DIVIDA" } } },
    include: { tempo: true, conta: true },
    orderBy: [{ tempo: { ano: "asc" } }, { periodo: "asc" }],
  });

  const data = divida.map((d) => ({
    ano: d.tempo.ano,
    periodo: d.periodo,
    conta: d.conta.descricao,
    cod_conta: d.conta.cod_conta,
    valor: d.valor,
  }));

  return NextResponse.json(data);
}
