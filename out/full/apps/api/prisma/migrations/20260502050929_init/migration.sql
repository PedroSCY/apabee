-- CreateEnum
CREATE TYPE "RoleUsuario" AS ENUM ('ADMIN', 'ASSOCIADO');

-- CreateEnum
CREATE TYPE "StatusAtribuicao" AS ENUM ('ATIVO', 'DEVOLVIDO');

-- CreateEnum
CREATE TYPE "TipoPatrimonio" AS ENUM ('EQUIPAMENTO', 'INSUMO');

-- CreateEnum
CREATE TYPE "CategoriaInsumo" AS ENUM ('FERRAMENTA', 'INSUMO');

-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('KG', 'LITRO', 'UNIDADE', 'GRAMA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "TipoLote" AS ENUM ('PRODUCAO', 'AQUISICAO');

-- CreateEnum
CREATE TYPE "TipoVenda" AS ENUM ('COLETIVA', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "TipoMovimentoFinanceiro" AS ENUM ('ANTECIPACAO', 'RATEIO_FINAL');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDENTE', 'CONFIRMADO', 'EM_PREPARO', 'ENVIADO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('ATA', 'FINANCEIRO', 'PRESTACAO_CONTAS', 'RELATORIO', 'OUTRO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RoleUsuario" NOT NULL DEFAULT 'ASSOCIADO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "associados" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_ingresso" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "associados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numero_serie" TEXT,
    "descricao" TEXT,
    "em_uso" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaInsumo" NOT NULL,
    "descricao" TEXT,
    "em_uso" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atribuicoes_patrimonio" (
    "id" TEXT NOT NULL,
    "tipo_patrimonio" "TipoPatrimonio" NOT NULL,
    "equipamento_id" TEXT,
    "insumo_id" TEXT,
    "associado_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "status" "StatusAtribuicao" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,

    CONSTRAINT "atribuicoes_patrimonio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_materia_prima" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "tipos_materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_producao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoLote" NOT NULL,
    "periodo" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "custo_total" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "lotes_producao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participacoes_lote" (
    "id" TEXT NOT NULL,
    "lote_producao_id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "percentual" DECIMAL(5,2) NOT NULL,
    "volume" DECIMAL(10,3),
    "valor_investido" DECIMAL(10,2),

    CONSTRAINT "participacoes_lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colheitas" (
    "id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "tipo_materia_prima_id" TEXT NOT NULL,
    "equipamento_id" TEXT,
    "lote_producao_id" TEXT NOT NULL,
    "volume" DECIMAL(10,3) NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL,
    "data_colheita" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colheitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque_materia_prima" (
    "id" TEXT NOT NULL,
    "tipo_materia_prima_id" TEXT NOT NULL,
    "quantidade_disponivel" DECIMAL(10,3) NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estoque_materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "estoque_id" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "referencia_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "imagem_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "lote_origem_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque_produtos" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade_disponivel" INTEGER NOT NULL DEFAULT 0,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estoque_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composicoes_produto" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "tipo_materia_prima_id" TEXT NOT NULL,
    "quantidade_necessaria" DECIMAL(10,3) NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL,

    CONSTRAINT "composicoes_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "cliente_nome" TEXT NOT NULL,
    "cliente_email" TEXT NOT NULL,
    "cliente_telefone" TEXT,
    "status" "StatusPedido" NOT NULL DEFAULT 'PENDENTE',
    "total" DECIMAL(10,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "lote_producao_id" TEXT NOT NULL,
    "associado_id" TEXT,
    "tipo" "TipoVenda" NOT NULL,
    "volume" DECIMAL(10,3) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentos_financeiros" (
    "id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "lote_producao_id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoMovimentoFinanceiro" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentos_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apuracoes_lote" (
    "id" TEXT NOT NULL,
    "lote_producao_id" TEXT NOT NULL,
    "faturamento_total" DECIMAL(10,2) NOT NULL,
    "fechado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apuracoes_lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "data_reuniao" TIMESTAMP(3) NOT NULL,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes_ata" (
    "id" TEXT NOT NULL,
    "ata_id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,

    CONSTRAINT "participantes_ata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" "CategoriaDocumento" NOT NULL,
    "arquivo_url" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "autor_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_associacao" (
    "id" TEXT NOT NULL,
    "nome_exibido" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_associacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios_producao" (
    "id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "gerado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorios_producao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "associados_usuario_id_key" ON "associados"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_materia_prima_nome_key" ON "tipos_materia_prima"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "participacoes_lote_lote_producao_id_associado_id_key" ON "participacoes_lote"("lote_producao_id", "associado_id");

-- CreateIndex
CREATE UNIQUE INDEX "estoque_materia_prima_tipo_materia_prima_id_key" ON "estoque_materia_prima"("tipo_materia_prima_id");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_slug_key" ON "produtos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "estoque_produtos_produto_id_key" ON "estoque_produtos"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "composicoes_produto_produto_id_tipo_materia_prima_id_key" ON "composicoes_produto"("produto_id", "tipo_materia_prima_id");

-- CreateIndex
CREATE UNIQUE INDEX "apuracoes_lote_lote_producao_id_key" ON "apuracoes_lote"("lote_producao_id");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_ata_ata_id_associado_id_key" ON "participantes_ata"("ata_id", "associado_id");

-- AddForeignKey
ALTER TABLE "associados" ADD CONSTRAINT "associados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atribuicoes_patrimonio" ADD CONSTRAINT "atribuicoes_patrimonio_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atribuicoes_patrimonio" ADD CONSTRAINT "atribuicoes_patrimonio_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atribuicoes_patrimonio" ADD CONSTRAINT "atribuicoes_patrimonio_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes_lote" ADD CONSTRAINT "participacoes_lote_lote_producao_id_fkey" FOREIGN KEY ("lote_producao_id") REFERENCES "lotes_producao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes_lote" ADD CONSTRAINT "participacoes_lote_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colheitas" ADD CONSTRAINT "colheitas_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colheitas" ADD CONSTRAINT "colheitas_tipo_materia_prima_id_fkey" FOREIGN KEY ("tipo_materia_prima_id") REFERENCES "tipos_materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colheitas" ADD CONSTRAINT "colheitas_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colheitas" ADD CONSTRAINT "colheitas_lote_producao_id_fkey" FOREIGN KEY ("lote_producao_id") REFERENCES "lotes_producao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque_materia_prima" ADD CONSTRAINT "estoque_materia_prima_tipo_materia_prima_id_fkey" FOREIGN KEY ("tipo_materia_prima_id") REFERENCES "tipos_materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_estoque_id_fkey" FOREIGN KEY ("estoque_id") REFERENCES "estoque_materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_lote_origem_id_fkey" FOREIGN KEY ("lote_origem_id") REFERENCES "lotes_producao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque_produtos" ADD CONSTRAINT "estoque_produtos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composicoes_produto" ADD CONSTRAINT "composicoes_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composicoes_produto" ADD CONSTRAINT "composicoes_produto_tipo_materia_prima_id_fkey" FOREIGN KEY ("tipo_materia_prima_id") REFERENCES "tipos_materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_lote_producao_id_fkey" FOREIGN KEY ("lote_producao_id") REFERENCES "lotes_producao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_financeiros" ADD CONSTRAINT "movimentos_financeiros_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_financeiros" ADD CONSTRAINT "movimentos_financeiros_lote_producao_id_fkey" FOREIGN KEY ("lote_producao_id") REFERENCES "lotes_producao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apuracoes_lote" ADD CONSTRAINT "apuracoes_lote_lote_producao_id_fkey" FOREIGN KEY ("lote_producao_id") REFERENCES "lotes_producao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_ata" ADD CONSTRAINT "participantes_ata_ata_id_fkey" FOREIGN KEY ("ata_id") REFERENCES "atas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_ata" ADD CONSTRAINT "participantes_ata_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
