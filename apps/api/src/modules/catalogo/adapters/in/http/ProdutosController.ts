import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  ComposicaoProduto,
  EstoqueProduto,
  IArquivarProdutoUseCase,
  IAtualizarProdutoUseCase,
  IBuscarProdutoUseCase,
  IConsultarCapacidadeUseCase,
  ICriarComposicaoProdutoUseCase,
  ICriarProdutoUseCase,
  IEstoqueProdutoRepository,
  IGerarEstoqueProdutoUseCase,
  IListarProdutosUseCase,
  IPublicarProdutoUseCase,
  IRemoverComposicaoProdutoUseCase,
  Produto,
} from '@apa/core'
import { Public, Roles } from '../../../../../shared/guards'
import { AdicionarComposicaoDto, AtualizarProdutoDto, CriarProdutoDto, GerarEstoqueDto } from './dto'
import {
  ADICIONAR_COMPOSICAO_USE_CASE,
  ARQUIVAR_PRODUTO_USE_CASE,
  ATUALIZAR_PRODUTO_USE_CASE,
  BUSCAR_PRODUTO_USE_CASE,
  CONSULTAR_CAPACIDADE_USE_CASE,
  CRIAR_PRODUTO_USE_CASE,
  ESTOQUE_PRODUTO_REPOSITORY,
  GERAR_ESTOQUE_PRODUTO_USE_CASE,
  LISTAR_PRODUTOS_USE_CASE,
  PUBLICAR_PRODUTO_USE_CASE,
  REMOVER_COMPOSICAO_USE_CASE,
} from '../../../catalogo.tokens'

@ApiTags('Catálogo')
@ApiBearerAuth('JWT')
@Controller('catalogo/produtos')
export class ProdutosController {
  constructor(
    @Inject(CRIAR_PRODUTO_USE_CASE) private readonly criar: ICriarProdutoUseCase,
    @Inject(LISTAR_PRODUTOS_USE_CASE) private readonly listar: IListarProdutosUseCase,
    @Inject(BUSCAR_PRODUTO_USE_CASE) private readonly buscar: IBuscarProdutoUseCase,
    @Inject(ATUALIZAR_PRODUTO_USE_CASE) private readonly atualizar: IAtualizarProdutoUseCase,
    @Inject(PUBLICAR_PRODUTO_USE_CASE) private readonly publicar: IPublicarProdutoUseCase,
    @Inject(ARQUIVAR_PRODUTO_USE_CASE) private readonly arquivar: IArquivarProdutoUseCase,
    @Inject(GERAR_ESTOQUE_PRODUTO_USE_CASE) private readonly gerarEstoque: IGerarEstoqueProdutoUseCase,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY) private readonly estoqueRepo: IEstoqueProdutoRepository,
    @Inject(ADICIONAR_COMPOSICAO_USE_CASE) private readonly adicionarComposicao: ICriarComposicaoProdutoUseCase,
    @Inject(REMOVER_COMPOSICAO_USE_CASE) private readonly removerComposicao: IRemoverComposicaoProdutoUseCase,
    @Inject(CONSULTAR_CAPACIDADE_USE_CASE) private readonly consultarCapacidade: IConsultarCapacidadeUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar produto (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Produto criado em rascunho.' })
  @Post()
  @Roles(RoleUsuario.ADMIN)
  async criarHandler(@Body() dto: CriarProdutoDto) {
    const produto = await this.criar.execute(dto)
    return this.toProdutoResponse(produto)
  }

  @ApiOperation({ summary: 'Listar produtos' })
  @ApiQuery({ name: 'publicos', required: false, type: Boolean, description: 'true = apenas publicados' })
  @Get()
  @Public()
  async listarHandler(@Query('publicos') publicos?: string) {
    const apenasPublicados = publicos === 'true'
    const lista = await this.listar.execute({ apenasPublicados })
    const estoques = await Promise.all(lista.map((p) => this.estoqueRepo.findByProduto(p.id)))
    return lista.map((p, i) => ({
      ...this.toProdutoResponse(p),
      quantidadeEstoque: estoques[i]?.quantidadeDisponivel ?? 0,
    }))
  }

  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @Get(':id')
  @Public()
  async buscarHandler(@Param('id') id: string) {
    const { produto, estoque, composicoes } = await this.buscar.execute(id)
    return {
      ...this.toProdutoResponse(produto),
      estoque: estoque ? this.toEstoqueResponse(estoque) : null,
      composicoes: composicoes.map((c) => this.toComposicaoResponse(c)),
    }
  }

  @ApiOperation({ summary: 'Atualizar produto (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @Patch(':id')
  @Roles(RoleUsuario.ADMIN)
  async atualizarHandler(@Param('id') id: string, @Body() dto: AtualizarProdutoDto) {
    const produto = await this.atualizar.execute({ produtoId: id, ...dto })
    return this.toProdutoResponse(produto)
  }

  @ApiOperation({ summary: 'Publicar produto (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiNoContentResponse()
  @Patch(':id/publicar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleUsuario.ADMIN)
  async publicarHandler(@Param('id') id: string) {
    await this.publicar.execute(id)
  }

  @ApiOperation({ summary: 'Arquivar produto (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiNoContentResponse()
  @Patch(':id/arquivar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleUsuario.ADMIN)
  async arquivarHandler(@Param('id') id: string) {
    await this.arquivar.execute(id)
  }

  @ApiOperation({ summary: 'Consultar capacidade máxima de extração a partir de um lote (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiQuery({ name: 'loteId', required: true, description: 'UUID do lote de origem' })
  @Get(':id/capacidade')
  @Roles(RoleUsuario.ADMIN)
  async capacidadeHandler(@Param('id') id: string, @Query('loteId') loteId: string) {
    return this.consultarCapacidade.execute({ produtoId: id, loteId })
  }

  @ApiOperation({ summary: 'Gerar estoque de produto (ADMIN) — RN05' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @Post(':id/gerar-estoque')
  @Roles(RoleUsuario.ADMIN)
  async gerarEstoqueHandler(@Param('id') id: string, @Body() dto: GerarEstoqueDto) {
    const estoque = await this.gerarEstoque.execute({
      produtoId: id,
      quantidade: dto.quantidade,
      loteOrigemId: dto.loteOrigemId,
    })
    return this.toEstoqueResponse(estoque)
  }

  @ApiOperation({ summary: 'Adicionar ingrediente à composição do produto (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 201, description: 'Composição adicionada.' })
  @Post(':id/composicoes')
  @Roles(RoleUsuario.ADMIN)
  async adicionarComposicaoHandler(@Param('id') id: string, @Body() dto: AdicionarComposicaoDto) {
    const composicao = await this.adicionarComposicao.execute({
      produtoId: id,
      tipoMateriaPrimaId: dto.tipoMateriaPrimaId,
      quantidadeNecessaria: dto.quantidadeNecessaria,
      unidade: dto.unidade,
    })
    return this.toComposicaoResponse(composicao)
  }

  @ApiOperation({ summary: 'Remover ingrediente da composição do produto (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiParam({ name: 'composicaoId', description: 'UUID da composição' })
  @ApiNoContentResponse()
  @Delete(':id/composicoes/:composicaoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleUsuario.ADMIN)
  async removerComposicaoHandler(@Param('composicaoId') composicaoId: string) {
    await this.removerComposicao.execute(composicaoId)
  }

  private toProdutoResponse(p: Produto) {
    return {
      id: p.id,
      nome: p.nome,
      slug: p.slug,
      descricao: p.descricao,
      preco: p.preco,
      imagemUrl: p.imagemUrl,
      status: p.status,
      loteOrigemId: p.loteOrigemId,
      criadoEm: p.criadoEm,
    }
  }

  private toEstoqueResponse(e: EstoqueProduto) {
    return {
      id: e.id,
      produtoId: e.produtoId,
      quantidadeDisponivel: e.quantidadeDisponivel,
    }
  }

  private toComposicaoResponse(c: ComposicaoProduto) {
    return {
      id: c.id,
      tipoMateriaPrimaId: c.tipoMateriaPrimaId,
      quantidadeNecessaria: c.quantidadeNecessaria,
      unidade: c.unidade,
    }
  }
}
