/*
  Warnings:

  - You are about to drop the column `em_uso` on the `equipamentos` table. All the data in the column will be lost.
  - You are about to drop the column `em_uso` on the `insumos` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `lotes_producao` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `produtos` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusAssociado" AS ENUM ('ATIVO', 'PENDENTE', 'SUSPENSO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusPatrimonio" AS ENUM ('DISPONIVEL', 'EM_USO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "StatusLote" AS ENUM ('ABERTO', 'FECHADO');

-- CreateEnum
CREATE TYPE "StatusProduto" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADO', 'NA_FILA', 'REPROVADO');

-- AlterTable
ALTER TABLE "associados" ADD COLUMN     "status" "StatusAssociado" NOT NULL DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "equipamentos" DROP COLUMN "em_uso",
ADD COLUMN     "status" "StatusPatrimonio" NOT NULL DEFAULT 'DISPONIVEL';

-- AlterTable
ALTER TABLE "insumos" DROP COLUMN "em_uso",
ADD COLUMN     "status" "StatusPatrimonio" NOT NULL DEFAULT 'DISPONIVEL';

-- AlterTable
ALTER TABLE "lotes_producao" DROP COLUMN "ativo",
ADD COLUMN     "status" "StatusLote" NOT NULL DEFAULT 'ABERTO';

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "ativo",
ADD COLUMN     "status" "StatusProduto" NOT NULL DEFAULT 'RASCUNHO';
