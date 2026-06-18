/*
  Warnings:

  - Made the column `bimestre` on table `dim_tempo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quadrimestre` on table `dim_tempo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `label` on table `dim_tempo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dim_tempo" ALTER COLUMN "bimestre" SET NOT NULL,
ALTER COLUMN "bimestre" SET DEFAULT 0,
ALTER COLUMN "quadrimestre" SET NOT NULL,
ALTER COLUMN "quadrimestre" SET DEFAULT 0,
ALTER COLUMN "label" SET NOT NULL;
