import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { ProducaoModule } from '../producao/producao.module'
import { ProdutosController } from './adapters/in/http/ProdutosController'
import {
  PrismaComposicaoProdutoRepository,
  PrismaEstoqueProdutoRepository,
  PrismaProdutoRepository,
} from './adapters/out/persistence'
import {
  AdicionarComposicaoProdutoUseCase,
  ArquivarProdutoUseCase,
  AtualizarProdutoUseCase,
  BuscarProdutoUseCase,
  ConsultarCapacidadeUseCase,
  CriarProdutoUseCase,
  GerarEstoqueProdutoUseCase,
  ListarProdutosUseCase,
  PublicarProdutoUseCase,
  RemoverComposicaoProdutoUseCase,
} from './application/use-cases'
import {
  ADICIONAR_COMPOSICAO_USE_CASE,
  ARQUIVAR_PRODUTO_USE_CASE,
  ATUALIZAR_PRODUTO_USE_CASE,
  BUSCAR_PRODUTO_USE_CASE,
  COMPOSICAO_PRODUTO_REPOSITORY,
  CONSULTAR_CAPACIDADE_USE_CASE,
  CRIAR_PRODUTO_USE_CASE,
  ESTOQUE_PRODUTO_REPOSITORY,
  GERAR_ESTOQUE_PRODUTO_USE_CASE,
  LISTAR_PRODUTOS_USE_CASE,
  PRODUTO_REPOSITORY,
  PUBLICAR_PRODUTO_USE_CASE,
  REMOVER_COMPOSICAO_USE_CASE,
} from './catalogo.tokens'

@Module({
  imports: [PrismaModule, ProducaoModule],
  controllers: [ProdutosController],
  providers: [
    { provide: PRODUTO_REPOSITORY, useClass: PrismaProdutoRepository },
    { provide: ESTOQUE_PRODUTO_REPOSITORY, useClass: PrismaEstoqueProdutoRepository },
    { provide: COMPOSICAO_PRODUTO_REPOSITORY, useClass: PrismaComposicaoProdutoRepository },
    { provide: CRIAR_PRODUTO_USE_CASE, useClass: CriarProdutoUseCase },
    { provide: LISTAR_PRODUTOS_USE_CASE, useClass: ListarProdutosUseCase },
    { provide: BUSCAR_PRODUTO_USE_CASE, useClass: BuscarProdutoUseCase },
    { provide: ATUALIZAR_PRODUTO_USE_CASE, useClass: AtualizarProdutoUseCase },
    { provide: PUBLICAR_PRODUTO_USE_CASE, useClass: PublicarProdutoUseCase },
    { provide: ARQUIVAR_PRODUTO_USE_CASE, useClass: ArquivarProdutoUseCase },
    { provide: GERAR_ESTOQUE_PRODUTO_USE_CASE, useClass: GerarEstoqueProdutoUseCase },
    { provide: ADICIONAR_COMPOSICAO_USE_CASE, useClass: AdicionarComposicaoProdutoUseCase },
    { provide: REMOVER_COMPOSICAO_USE_CASE, useClass: RemoverComposicaoProdutoUseCase },
    { provide: CONSULTAR_CAPACIDADE_USE_CASE, useClass: ConsultarCapacidadeUseCase },
  ],
  exports: [PRODUTO_REPOSITORY, ESTOQUE_PRODUTO_REPOSITORY],
})
/** Módulo NestJS de catálogo — produtos, estoque e composição. */
export class CatalogoModule {}
