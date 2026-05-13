-- CreateEnum
CREATE TYPE "StatusSolicitacaoPatrimonio" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- CreateTable
CREATE TABLE "solicitacoes_patrimonio" (
    "id" TEXT NOT NULL,
    "tipo_patrimonio" "TipoPatrimonio" NOT NULL,
    "equipamento_id" TEXT,
    "insumo_id" TEXT,
    "associado_id" TEXT NOT NULL,
    "justificativa" TEXT,
    "status" "StatusSolicitacaoPatrimonio" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvido_em" TIMESTAMP(3),

    CONSTRAINT "solicitacoes_patrimonio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "solicitacoes_patrimonio" ADD CONSTRAINT "solicitacoes_patrimonio_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_patrimonio" ADD CONSTRAINT "solicitacoes_patrimonio_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_patrimonio" ADD CONSTRAINT "solicitacoes_patrimonio_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
