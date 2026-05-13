-- CreateEnum
CREATE TYPE "CategoriaAviso" AS ENUM ('GERAL', 'URGENTE', 'REUNIAO', 'FINANCEIRO');

-- DropForeignKey
ALTER TABLE "associados" DROP CONSTRAINT "associados_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "atribuicoes_patrimonio" DROP CONSTRAINT "atribuicoes_patrimonio_associado_id_fkey";

-- DropForeignKey
ALTER TABLE "colheitas" DROP CONSTRAINT "colheitas_associado_id_fkey";

-- DropForeignKey
ALTER TABLE "movimentos_financeiros" DROP CONSTRAINT "movimentos_financeiros_associado_id_fkey";

-- DropForeignKey
ALTER TABLE "participacoes_lote" DROP CONSTRAINT "participacoes_lote_associado_id_fkey";

-- DropForeignKey
ALTER TABLE "participantes_ata" DROP CONSTRAINT "participantes_ata_associado_id_fkey";

-- AlterTable
ALTER TABLE "configuracao_associacao" ADD COLUMN     "cor_accent" TEXT,
ADD COLUMN     "cor_fundo" TEXT,
ADD COLUMN     "cor_primaria" TEXT,
ADD COLUMN     "cor_primaria_foreground" TEXT,
ADD COLUMN     "cor_sidebar" TEXT,
ADD COLUMN     "cor_texto" TEXT;

-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "categoria" "CategoriaAviso" NOT NULL DEFAULT 'GERAL',
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "fixado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "associados" ADD CONSTRAINT "associados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atribuicoes_patrimonio" ADD CONSTRAINT "atribuicoes_patrimonio_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes_lote" ADD CONSTRAINT "participacoes_lote_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colheitas" ADD CONSTRAINT "colheitas_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_financeiros" ADD CONSTRAINT "movimentos_financeiros_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_ata" ADD CONSTRAINT "participantes_ata_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
