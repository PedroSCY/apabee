-- CreateEnum
CREATE TYPE "TipoSolicitacaoContato" AS ENUM ('CONTATO', 'COLETA', 'INTEGRACAO');

-- CreateEnum
CREATE TYPE "StatusSolicitacaoContato" AS ENUM ('PENDENTE', 'VISUALIZADA', 'RESOLVIDA');

-- CreateTable
CREATE TABLE "solicitacoes_contato" (
    "id"          TEXT NOT NULL,
    "tipo"        "TipoSolicitacaoContato" NOT NULL,
    "status"      "StatusSolicitacaoContato" NOT NULL DEFAULT 'PENDENTE',
    "nome"        TEXT NOT NULL,
    "email"       TEXT NOT NULL,
    "telefone"    TEXT,
    "mensagem"    TEXT NOT NULL,
    "localizacao" TEXT,
    "municipio"   TEXT,
    "criado_em"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitacoes_contato_pkey" PRIMARY KEY ("id")
);
