import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const anos = await prisma.dim_tempo.findMany({
    select: { ano: true },
    distinct: ["ano"],
    orderBy: { ano: "asc" },
  });

  return NextResponse.json({ anos: anos.map((a) => a.ano) });
}
