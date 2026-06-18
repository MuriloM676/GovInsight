-- CreateTable
CREATE TABLE "dim_municipio" (
    "cod_ibge" INTEGER NOT NULL,
    "ente" TEXT NOT NULL,
    "capital" BOOLEAN NOT NULL DEFAULT false,
    "regiao" TEXT,
    "uf" TEXT NOT NULL,
    "esfera" TEXT,
    "cnpj" TEXT,

    CONSTRAINT "dim_municipio_pkey" PRIMARY KEY ("cod_ibge")
);

-- CreateTable
CREATE TABLE "dim_tempo" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "bimestre" INTEGER,
    "quadrimestre" INTEGER,
    "label" TEXT,

    CONSTRAINT "dim_tempo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dim_conta_dca" (
    "id" SERIAL NOT NULL,
    "cod_conta" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "anexo" TEXT,
    "nivel" INTEGER,
    "pai_id" INTEGER,

    CONSTRAINT "dim_conta_dca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dim_conta_rreo" (
    "id" SERIAL NOT NULL,
    "cod_conta" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT,

    CONSTRAINT "dim_conta_rreo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dim_conta_rgf" (
    "id" SERIAL NOT NULL,
    "cod_conta" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "anexo_rgf" TEXT,

    CONSTRAINT "dim_conta_rgf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dim_coluna" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo_valor" TEXT,

    CONSTRAINT "dim_coluna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dim_anexo" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "demonstrativo" TEXT NOT NULL,

    CONSTRAINT "dim_anexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fato_dca" (
    "id" SERIAL NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "tempo_id" INTEGER NOT NULL,
    "conta_id" INTEGER NOT NULL,
    "anexo_id" INTEGER NOT NULL,
    "coluna_id" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fato_dca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fato_receita" (
    "id" SERIAL NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "tempo_id" INTEGER NOT NULL,
    "conta_id" INTEGER NOT NULL,
    "coluna_id" INTEGER NOT NULL,
    "bimestre" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fato_receita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fato_despesa" (
    "id" SERIAL NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "tempo_id" INTEGER NOT NULL,
    "conta_id" INTEGER NOT NULL,
    "coluna_id" INTEGER NOT NULL,
    "bimestre" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fato_despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fato_rgf" (
    "id" SERIAL NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "tempo_id" INTEGER NOT NULL,
    "conta_id" INTEGER NOT NULL,
    "anexo_id" INTEGER NOT NULL,
    "coluna_id" INTEGER NOT NULL,
    "periodo" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fato_rgf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dim_municipio_uf_regiao_idx" ON "dim_municipio"("uf", "regiao");

-- CreateIndex
CREATE INDEX "dim_tempo_ano_idx" ON "dim_tempo"("ano");

-- CreateIndex
CREATE UNIQUE INDEX "dim_tempo_ano_bimestre_quadrimestre_key" ON "dim_tempo"("ano", "bimestre", "quadrimestre");

-- CreateIndex
CREATE INDEX "dim_conta_dca_anexo_idx" ON "dim_conta_dca"("anexo");

-- CreateIndex
CREATE UNIQUE INDEX "dim_conta_dca_cod_conta_key" ON "dim_conta_dca"("cod_conta");

-- CreateIndex
CREATE UNIQUE INDEX "dim_conta_rreo_cod_conta_tipo_key" ON "dim_conta_rreo"("cod_conta", "tipo");

-- CreateIndex
CREATE INDEX "dim_conta_rgf_anexo_rgf_idx" ON "dim_conta_rgf"("anexo_rgf");

-- CreateIndex
CREATE UNIQUE INDEX "dim_conta_rgf_cod_conta_key" ON "dim_conta_rgf"("cod_conta");

-- CreateIndex
CREATE UNIQUE INDEX "dim_coluna_codigo_key" ON "dim_coluna"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "dim_anexo_codigo_key" ON "dim_anexo"("codigo");

-- CreateIndex
CREATE INDEX "fato_dca_municipio_id_tempo_id_idx" ON "fato_dca"("municipio_id", "tempo_id");

-- CreateIndex
CREATE INDEX "fato_dca_conta_id_idx" ON "fato_dca"("conta_id");

-- CreateIndex
CREATE INDEX "fato_dca_anexo_id_idx" ON "fato_dca"("anexo_id");

-- CreateIndex
CREATE INDEX "fato_dca_tempo_id_idx" ON "fato_dca"("tempo_id");

-- CreateIndex
CREATE INDEX "fato_receita_municipio_id_tempo_id_idx" ON "fato_receita"("municipio_id", "tempo_id");

-- CreateIndex
CREATE INDEX "fato_receita_conta_id_idx" ON "fato_receita"("conta_id");

-- CreateIndex
CREATE INDEX "fato_receita_tempo_id_bimestre_idx" ON "fato_receita"("tempo_id", "bimestre");

-- CreateIndex
CREATE INDEX "fato_despesa_municipio_id_tempo_id_idx" ON "fato_despesa"("municipio_id", "tempo_id");

-- CreateIndex
CREATE INDEX "fato_despesa_conta_id_idx" ON "fato_despesa"("conta_id");

-- CreateIndex
CREATE INDEX "fato_despesa_tempo_id_bimestre_idx" ON "fato_despesa"("tempo_id", "bimestre");

-- CreateIndex
CREATE INDEX "fato_rgf_municipio_id_tempo_id_idx" ON "fato_rgf"("municipio_id", "tempo_id");

-- CreateIndex
CREATE INDEX "fato_rgf_conta_id_idx" ON "fato_rgf"("conta_id");

-- CreateIndex
CREATE INDEX "fato_rgf_anexo_id_idx" ON "fato_rgf"("anexo_id");

-- CreateIndex
CREATE INDEX "fato_rgf_tempo_id_idx" ON "fato_rgf"("tempo_id");

-- AddForeignKey
ALTER TABLE "dim_conta_dca" ADD CONSTRAINT "dim_conta_dca_pai_id_fkey" FOREIGN KEY ("pai_id") REFERENCES "dim_conta_dca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_dca" ADD CONSTRAINT "fato_dca_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "dim_municipio"("cod_ibge") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_dca" ADD CONSTRAINT "fato_dca_tempo_id_fkey" FOREIGN KEY ("tempo_id") REFERENCES "dim_tempo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_dca" ADD CONSTRAINT "fato_dca_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "dim_conta_dca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_dca" ADD CONSTRAINT "fato_dca_anexo_id_fkey" FOREIGN KEY ("anexo_id") REFERENCES "dim_anexo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_dca" ADD CONSTRAINT "fato_dca_coluna_id_fkey" FOREIGN KEY ("coluna_id") REFERENCES "dim_coluna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_receita" ADD CONSTRAINT "fato_receita_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "dim_municipio"("cod_ibge") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_receita" ADD CONSTRAINT "fato_receita_tempo_id_fkey" FOREIGN KEY ("tempo_id") REFERENCES "dim_tempo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_receita" ADD CONSTRAINT "fato_receita_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "dim_conta_rreo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_receita" ADD CONSTRAINT "fato_receita_coluna_id_fkey" FOREIGN KEY ("coluna_id") REFERENCES "dim_coluna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_despesa" ADD CONSTRAINT "fato_despesa_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "dim_municipio"("cod_ibge") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_despesa" ADD CONSTRAINT "fato_despesa_tempo_id_fkey" FOREIGN KEY ("tempo_id") REFERENCES "dim_tempo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_despesa" ADD CONSTRAINT "fato_despesa_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "dim_conta_rreo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_despesa" ADD CONSTRAINT "fato_despesa_coluna_id_fkey" FOREIGN KEY ("coluna_id") REFERENCES "dim_coluna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_rgf" ADD CONSTRAINT "fato_rgf_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "dim_municipio"("cod_ibge") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_rgf" ADD CONSTRAINT "fato_rgf_tempo_id_fkey" FOREIGN KEY ("tempo_id") REFERENCES "dim_tempo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_rgf" ADD CONSTRAINT "fato_rgf_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "dim_conta_rgf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_rgf" ADD CONSTRAINT "fato_rgf_anexo_id_fkey" FOREIGN KEY ("anexo_id") REFERENCES "dim_anexo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fato_rgf" ADD CONSTRAINT "fato_rgf_coluna_id_fkey" FOREIGN KEY ("coluna_id") REFERENCES "dim_coluna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
