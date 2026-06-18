import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const ativo = await prisma.fato_dca.findMany({
    where: { conta: { cod_conta: "P1.0.0.0.0.00.00" } },
    include: { tempo: true },
    orderBy: { tempo: { ano: "asc" } },
  });

  const passivo = await prisma.fato_dca.findMany({
    where: { conta: { cod_conta: "P2.0.0.0.0.00.00" } },
    include: { tempo: true },
    orderBy: { tempo: { ano: "asc" } },
  });

  const pl = await prisma.fato_dca.findMany({
    where: { conta: { cod_conta: "P2.3.0.0.0.00.00" } },
    include: { tempo: true },
    orderBy: { tempo: { ano: "asc" } },
  });

  const caixa = await prisma.fato_dca.findMany({
    where: { conta: { cod_conta: "P1.1.1.0.0.00.00" } },
    include: { tempo: true },
    orderBy: { tempo: { ano: "asc" } },
  });

  const anos = [...new Set(ativo.map((a) => a.tempo.ano))].sort();

  const data = anos.map((ano) => {
    const a = ativo.find((x) => x.tempo.ano === ano);
    const p = passivo.find((x) => x.tempo.ano === ano);
    const plVal = pl.find((x) => x.tempo.ano === ano);
    const cx = caixa.find((x) => x.tempo.ano === ano);
    return {
      ano,
      ativo: a?.valor || 0,
      passivo: p?.valor || 0,
      patrimonio_liquido: plVal?.valor || 0,
      caixa: cx?.valor || 0,
    };
  });

  return NextResponse.json(data);
}
