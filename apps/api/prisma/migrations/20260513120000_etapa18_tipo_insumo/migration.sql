-- CreateTable tipos_insumo
CREATE TABLE "tipos_insumo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" "CategoriaInsumo" NOT NULL,
    "sigla" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_insumo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tipos_insumo_sigla_key" ON "tipos_insumo"("sigla");

-- Limpar dados de desenvolvimento das tabelas afetadas
-- (solicitacoes de insumos e os proprios insumos)
DELETE FROM "solicitacoes_patrimonio" WHERE "insumo_id" IS NOT NULL;
DELETE FROM "insumos";

-- Remover colunas antigas de insumos
ALTER TABLE "insumos" DROP COLUMN IF EXISTS "nome";
ALTER TABLE "insumos" DROP COLUMN IF EXISTS "categoria";

-- Adicionar novas colunas em insumos
ALTER TABLE "insumos" ADD COLUMN "identificador" TEXT NOT NULL;
ALTER TABLE "insumos" ADD COLUMN "tipo_insumo_id" TEXT NOT NULL;

CREATE UNIQUE INDEX "insumos_identificador_key" ON "insumos"("identificador");

-- Adicionar FK de insumos -> tipos_insumo
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_tipo_insumo_id_fkey"
    FOREIGN KEY ("tipo_insumo_id") REFERENCES "tipos_insumo"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Atualizar solicitacoes_patrimonio: remover insumo_id, adicionar tipo_insumo_id + quantidade
ALTER TABLE "solicitacoes_patrimonio" DROP COLUMN IF EXISTS "insumo_id";
ALTER TABLE "solicitacoes_patrimonio" ADD COLUMN "tipo_insumo_id" TEXT;
ALTER TABLE "solicitacoes_patrimonio" ADD COLUMN "quantidade" INTEGER;

-- FK de solicitacoes -> tipos_insumo
ALTER TABLE "solicitacoes_patrimonio" ADD CONSTRAINT "solicitacoes_patrimonio_tipo_insumo_id_fkey"
    FOREIGN KEY ("tipo_insumo_id") REFERENCES "tipos_insumo"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
