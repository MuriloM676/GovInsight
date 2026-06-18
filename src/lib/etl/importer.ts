import { prisma } from "../db/prisma";
import { parseCsv, getDataDir } from "./csv-parser";
import path from "path";

function toFloat(v: string): number {
  const cleaned = v.replace(/\.$/, "").replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
}

function toInt(v: string): number {
  return parseInt(v.replace(/[^\d-]/g, ""), 10) || 0;
}

async function upsertTempo(ano: number, bimestre = 0, quadrimestre = 0) {
  const label = bimestre > 0
    ? `${ano}/${bimestre}`
    : quadrimestre > 0
      ? `${ano}/Q${quadrimestre}`
      : `${ano}`;

  return prisma.dim_tempo.upsert({
    where: { ano_bimestre_quadrimestre: { ano, bimestre, quadrimestre } },
    update: {},
    create: { ano, bimestre, quadrimestre, label },
  });
}

async function upsertColuna(codigo: string) {
  const tipo_valor = codigo.includes("PREVIS") || codigo.includes("DOTA")
    ? "ORCADO"
    : codigo.includes("LIQUIDADA") || codigo.includes("REALIZ")
      ? "REALIZADO"
      : codigo.includes("SALDO")
        ? "SALDO"
        : "OUTRO";

  return prisma.dim_coluna.upsert({
    where: { codigo },
    update: { descricao: codigo, tipo_valor },
    create: { codigo, descricao: codigo, tipo_valor },
  });
}

async function upsertAnexo(codigo: string, demonstrativo: string) {
  return prisma.dim_anexo.upsert({
    where: { codigo },
    update: { descricao: codigo, demonstrativo },
    create: { codigo, descricao: codigo, demonstrativo },
  });
}

function extractNivel(cod: string): number {
  const parts = cod.replace(/^P/, "").split(".");
  return parts.filter((p) => p !== "00" && p !== "").length;
}

export async function importMunicipios() {
  console.log("[ETL] Importando entes.csv...");
  const rows = parseCsv(path.join(getDataDir(), "entes.csv"));

  for (const row of rows) {
    const uf = row.uf?.trim() || null;
    const regiao = row.regiao?.trim() || null;
    const esfera = row.esfera?.trim() || null;
    const cnpj = row.cnpj?.trim() || null;

    await prisma.dim_municipio.upsert({
      where: { cod_ibge: toInt(row.cod_ibge) },
      update: { ente: row.ente, capital: row.capital?.trim() === "1", regiao, uf, esfera, cnpj },
      create: { cod_ibge: toInt(row.cod_ibge), ente: row.ente, capital: row.capital?.trim() === "1", regiao, uf, esfera, cnpj },
    });
  }

  console.log(`[ETL] ${rows.length} municípios importados.`);
}

export async function importDca() {
  console.log("[ETL] Importando dca.csv...");
  const rows = parseCsv(path.join(getDataDir(), "dca.csv"));

  const contaCache = new Map<string, number>();
  const colunaCache = new Map<string, number>();
  const anexoCache = new Map<string, number>();
  const tempoCache = new Map<string, number>();

  let count = 0;
  const batch: {
    municipio_id: number; tempo_id: number; conta_id: number;
    anexo_id: number; coluna_id: number; valor: number;
  }[] = [];

  for (const row of rows) {
    const ano = toInt(row.ano);

    const tempoKey = `${ano}`;
    if (!tempoCache.has(tempoKey)) { tempoCache.set(tempoKey, (await upsertTempo(ano)).id); }

    const colunaKey = row.coluna;
    if (!colunaCache.has(colunaKey)) { colunaCache.set(colunaKey, (await upsertColuna(colunaKey)).id); }

    const anexoKey = row.anexo;
    if (!anexoCache.has(anexoKey)) { anexoCache.set(anexoKey, (await upsertAnexo(anexoKey, "DCA")).id); }

    const contaKey = row.cod_conta;
    if (!contaCache.has(contaKey)) {
      const c = await prisma.dim_conta_dca.upsert({
        where: { cod_conta: row.cod_conta },
        update: { descricao: row.conta, anexo: row.anexo, nivel: extractNivel(row.cod_conta) },
        create: { cod_conta: row.cod_conta, descricao: row.conta, anexo: row.anexo, nivel: extractNivel(row.cod_conta) },
      });
      contaCache.set(contaKey, c.id);
    }

    batch.push({
      municipio_id: toInt(row.cod_ibge),
      tempo_id: tempoCache.get(tempoKey)!,
      conta_id: contaCache.get(contaKey)!,
      anexo_id: anexoCache.get(anexoKey)!,
      coluna_id: colunaCache.get(colunaKey)!,
      valor: toFloat(row.valor),
    });
    count++;

    if (batch.length >= 500) {
      await prisma.fato_dca.createMany({ data: batch });
      batch.length = 0;
    }
  }

  if (batch.length > 0) { await prisma.fato_dca.createMany({ data: batch }); }
  console.log(`[ETL] ${count} registros DCA importados.`);
}

export async function importReceitas() {
  console.log("[ETL] Importando receitas.csv...");
  const rows = parseCsv(path.join(getDataDir(), "receitas.csv"));

  const contaCache = new Map<string, number>();
  const colunaCache = new Map<string, number>();
  const tempoCache = new Map<string, number>();

  let count = 0;
  const batch: {
    municipio_id: number; tempo_id: number; conta_id: number;
    coluna_id: number; bimestre: number; valor: number;
  }[] = [];

  for (const row of rows) {
    const ano = toInt(row.ano);
    const bimestre = toInt(row.bimestre);

    const tempoKey = `${ano}-${bimestre}`;
    if (!tempoCache.has(tempoKey)) { tempoCache.set(tempoKey, (await upsertTempo(ano, bimestre)).id); }

    const colunaKey = row.coluna;
    if (!colunaCache.has(colunaKey)) { colunaCache.set(colunaKey, (await upsertColuna(colunaKey)).id); }

    const contaKey = `${row.cod_conta}::${row.tipo}`;
    if (!contaCache.has(contaKey)) {
      const c = await prisma.dim_conta_rreo.upsert({
        where: { cod_conta_tipo: { cod_conta: row.cod_conta, tipo: row.tipo } },
        update: { descricao: row.conta },
        create: { cod_conta: row.cod_conta, descricao: row.conta, tipo: row.tipo },
      });
      contaCache.set(contaKey, c.id);
    }

    batch.push({
      municipio_id: toInt(row.cod_ibge),
      tempo_id: tempoCache.get(tempoKey)!,
      conta_id: contaCache.get(contaKey)!,
      coluna_id: colunaCache.get(colunaKey)!,
      bimestre,
      valor: toFloat(row.valor),
    });
    count++;

    if (batch.length >= 500) {
      await prisma.fato_receita.createMany({ data: batch });
      batch.length = 0;
    }
  }

  if (batch.length > 0) { await prisma.fato_receita.createMany({ data: batch }); }
  console.log(`[ETL] ${count} registros de receitas importados.`);
}

export async function importDespesas() {
  console.log("[ETL] Importando despesas.csv...");
  const rows = parseCsv(path.join(getDataDir(), "despesas.csv"));

  const contaCache = new Map<string, number>();
  const colunaCache = new Map<string, number>();
  const tempoCache = new Map<string, number>();

  let count = 0;
  const batch: {
    municipio_id: number; tempo_id: number; conta_id: number;
    coluna_id: number; bimestre: number; valor: number;
  }[] = [];

  for (const row of rows) {
    const ano = toInt(row.ano);
    const bimestre = toInt(row.bimestre);

    const tempoKey = `${ano}-${bimestre}`;
    if (!tempoCache.has(tempoKey)) { tempoCache.set(tempoKey, (await upsertTempo(ano, bimestre)).id); }

    const colunaKey = row.coluna;
    if (!colunaCache.has(colunaKey)) { colunaCache.set(colunaKey, (await upsertColuna(colunaKey)).id); }

    const contaKey = `${row.cod_conta}::${row.tipo}`;
    if (!contaCache.has(contaKey)) {
      const c = await prisma.dim_conta_rreo.upsert({
        where: { cod_conta_tipo: { cod_conta: row.cod_conta, tipo: row.tipo } },
        update: { descricao: row.conta },
        create: { cod_conta: row.cod_conta, descricao: row.conta, tipo: row.tipo },
      });
      contaCache.set(contaKey, c.id);
    }

    batch.push({
      municipio_id: toInt(row.cod_ibge),
      tempo_id: tempoCache.get(tempoKey)!,
      conta_id: contaCache.get(contaKey)!,
      coluna_id: colunaCache.get(colunaKey)!,
      bimestre,
      valor: toFloat(row.valor),
    });
    count++;

    if (batch.length >= 500) {
      await prisma.fato_despesa.createMany({ data: batch });
      batch.length = 0;
    }
  }

  if (batch.length > 0) { await prisma.fato_despesa.createMany({ data: batch }); }
  console.log(`[ETL] ${count} registros de despesas importados.`);
}

export async function importRgf() {
  console.log("[ETL] Importando rgf.csv...");
  const rows = parseCsv(path.join(getDataDir(), "rgf.csv"));

  const contaCache = new Map<string, number>();
  const colunaCache = new Map<string, number>();
  const anexoCache = new Map<string, number>();
  const tempoCache = new Map<string, number>();

  const batch: {
    municipio_id: number; tempo_id: number; conta_id: number;
    anexo_id: number; coluna_id: number; periodo: number; valor: number;
  }[] = [];

  let count = 0;
  for (const row of rows) {
    const ano = toInt(row.ano);
    const periodo = toInt(row.periodo);

    const tempoKey = `${ano}-Q${periodo}`;
    if (!tempoCache.has(tempoKey)) { tempoCache.set(tempoKey, (await upsertTempo(ano, 0, periodo)).id); }

    const colunaKey = row.coluna;
    if (!colunaCache.has(colunaKey)) { colunaCache.set(colunaKey, (await upsertColuna(colunaKey)).id); }

    const anexoKey = row.anexo_rgf;
    if (!anexoCache.has(anexoKey)) { anexoCache.set(anexoKey, (await upsertAnexo(anexoKey, "RGF")).id); }

    const contaKey = row.cod_conta;
    if (!contaCache.has(contaKey)) {
      const c = await prisma.dim_conta_rgf.upsert({
        where: { cod_conta: row.cod_conta },
        update: { descricao: row.conta, anexo_rgf: row.anexo_rgf },
        create: { cod_conta: row.cod_conta, descricao: row.conta, anexo_rgf: row.anexo_rgf },
      });
      contaCache.set(contaKey, c.id);
    }

    batch.push({
      municipio_id: toInt(row.cod_ibge),
      tempo_id: tempoCache.get(tempoKey)!,
      conta_id: contaCache.get(contaKey)!,
      anexo_id: anexoCache.get(anexoKey)!,
      coluna_id: colunaCache.get(colunaKey)!,
      periodo,
      valor: toFloat(row.valor),
    });
    count++;

    if (batch.length >= 500) {
      await prisma.fato_rgf.createMany({ data: batch });
      batch.length = 0;
    }
  }

  if (batch.length > 0) { await prisma.fato_rgf.createMany({ data: batch }); }
  console.log(`[ETL] ${count} registros RGF importados.`);
}

export async function runEtl() {
  console.log("[ETL] Iniciando importação...");

  await prisma.fato_rgf.deleteMany();
  await prisma.fato_despesa.deleteMany();
  await prisma.fato_receita.deleteMany();
  await prisma.fato_dca.deleteMany();

  await importMunicipios();
  await importDca();
  await importReceitas();
  await importDespesas();
  await importRgf();

  console.log("[ETL] Importação concluída!");
}
