-- Migration: substituir enum TipoFlorada por model Florada com FK em Safra
-- Cria tabela floradas, seed com valores do enum, migra safras.florada para florada_id

-- 1. Criar tabela floradas
CREATE TABLE "floradas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floradas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "floradas_nome_key" ON "floradas"("nome");

-- 2. Seed com os 5 valores do enum TipoFlorada
INSERT INTO "floradas" ("id", "nome") VALUES
    (gen_random_uuid()::text, 'Laranjeira'),
    (gen_random_uuid()::text, 'Eucalipto'),
    (gen_random_uuid()::text, 'Silvestre'),
    (gen_random_uuid()::text, 'Aroeira'),
    (gen_random_uuid()::text, 'Outro');

-- 3. Adicionar coluna florada_id em safras (nullable temporariamente)
ALTER TABLE "safras" ADD COLUMN "florada_id" TEXT;

-- 4. Preencher florada_id a partir do valor do enum florada
UPDATE "safras" SET "florada_id" = (
    SELECT "id" FROM "floradas" WHERE "nome" =
        CASE "safras"."florada"::TEXT
            WHEN 'LARANJEIRA' THEN 'Laranjeira'
            WHEN 'EUCALIPTO'  THEN 'Eucalipto'
            WHEN 'SILVESTRE'  THEN 'Silvestre'
            WHEN 'AROEIRA'    THEN 'Aroeira'
            WHEN 'OUTRO'      THEN 'Outro'
            ELSE 'Outro'
        END
);

-- 5. Tornar florada_id NOT NULL e adicionar FK
ALTER TABLE "safras" ALTER COLUMN "florada_id" SET NOT NULL;

ALTER TABLE "safras"
    ADD CONSTRAINT "safras_florada_id_fkey"
    FOREIGN KEY ("florada_id") REFERENCES "floradas"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Remover coluna florada (enum) de safras
ALTER TABLE "safras" DROP COLUMN "florada";

-- 7. Remover o enum TipoFlorada (já não é referenciado)
DROP TYPE IF EXISTS "TipoFlorada";
