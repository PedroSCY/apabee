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
  Request,
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
import { Roles } from '../../../../../shared/guards'
import { SseService } from '../../../../../shared/sse/sse.service'
import { CategoriaDocumento, RoleUsuario } from '@apa/shared'
import {
  Documento,
  ICriarDocumentoUseCase,
  IDespublicarDocumentoUseCase,
  IExcluirDocumentoUseCase,
  IListarDocumentosUseCase,
  IPublicarDocumentoUseCase,
} from '@apa/core'
import {
  CRIAR_DOCUMENTO_USE_CASE,
  DESPUBLICAR_DOCUMENTO_USE_CASE,
  EXCLUIR_DOCUMENTO_USE_CASE,
  LISTAR_DOCUMENTOS_USE_CASE,
  PUBLICAR_DOCUMENTO_USE_CASE,
} from '../../../gestao.tokens'
import { CriarDocumentoDto } from './dto/CriarDocumentoDto'

@ApiTags('Gestão — Documentos')
@ApiBearerAuth('JWT')
@Controller('gestao/documentos')
export class DocumentosController {
  constructor(
    @Inject(CRIAR_DOCUMENTO_USE_CASE) private readonly criarDoc: ICriarDocumentoUseCase,
    @Inject(LISTAR_DOCUMENTOS_USE_CASE) private readonly listarDocs: IListarDocumentosUseCase,
    @Inject(PUBLICAR_DOCUMENTO_USE_CASE) private readonly publicarDoc: IPublicarDocumentoUseCase,
    @Inject(DESPUBLICAR_DOCUMENTO_USE_CASE) private readonly despublicarDoc: IDespublicarDocumentoUseCase,
    @Inject(EXCLUIR_DOCUMENTO_USE_CASE) private readonly excluirDoc: IExcluirDocumentoUseCase,
    private readonly sse: SseService,
  ) {}

  @ApiOperation({ summary: 'Criar documento (ADMIN)', description: 'Registra metadados de um arquivo já enviado ao Supabase Storage. Admin fornece a URL gerada pelo upload client-side.' })
  @ApiResponse({ status: 201, description: 'Documento criado.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão (requer ADMIN).' })
  @Post()
  @Roles(RoleUsuario.ADMIN)
  async criar(@Body() dto: CriarDocumentoDto, @Request() req: { user: { sub: string } }) {
    const doc = await this.criarDoc.execute({
      titulo: dto.titulo,
      categoria: dto.categoria,
      arquivoUrl: dto.arquivoUrl,
      tamanhoBytes: dto.tamanhoBytes,
      autorId: req.user.sub,
      publicado: dto.publicado,
    })
    return this.toResponse(doc)
  }

  @ApiOperation({ summary: 'Listar documentos', description: 'Admin vê todos (publicados e rascunhos). Associado vê apenas publicados. Filtrável por categoria.' })
  @ApiQuery({ name: 'categoria', enum: CategoriaDocumento, enumName: 'CategoriaDocumento', required: false, description: 'Filtrar por categoria' })
  @ApiResponse({ status: 200, description: 'Lista de documentos.' })
  @Get()
  async listar(
    @Query('categoria') categoria?: string,
    @Request() req?: { user: { role: string } },
  ) {
    const cat = categoria as CategoriaDocumento | undefined
    const apenasPublicados = req?.user?.role !== RoleUsuario.ADMIN
    const lista = await this.listarDocs.execute(cat, apenasPublicados)
    return lista.map((d) => this.toResponse(d))
  }

  @ApiOperation({ summary: 'Publicar documento (ADMIN)', description: 'Torna o documento visível para todos os associados.' })
  @ApiParam({ name: 'id', description: 'UUID do documento' })
  @ApiResponse({ status: 200, description: 'Documento publicado.' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  @Patch(':id/publicar')
  @Roles(RoleUsuario.ADMIN)
  async publicar(@Param('id') id: string) {
    const doc = await this.publicarDoc.execute(id)
    this.sse.emit('gestao:documento-publicado', id)
    return this.toResponse(doc)
  }

  @ApiOperation({ summary: 'Despublicar documento (ADMIN)', description: 'Volta o documento para rascunho — deixa de ser visível para associados.' })
  @ApiParam({ name: 'id', description: 'UUID do documento' })
  @ApiResponse({ status: 200, description: 'Documento despublicado.' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  @Patch(':id/despublicar')
  @Roles(RoleUsuario.ADMIN)
  async despublicar(@Param('id') id: string) {
    const doc = await this.despublicarDoc.execute(id)
    this.sse.emit('gestao:documento-despublicado', id)
    return this.toResponse(doc)
  }

  @ApiOperation({ summary: 'Excluir documento permanentemente (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do documento' })
  @ApiNoContentResponse({ description: 'Documento excluído.' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(RoleUsuario.ADMIN)
  async excluir(@Param('id') id: string) {
    await this.excluirDoc.execute(id)
  }

  private toResponse(d: Documento) {
    return {
      id: d.id,
      titulo: d.titulo,
      categoria: d.categoria,
      arquivoUrl: d.arquivoUrl,
      tamanhoBytes: d.tamanhoBytes,
      publicado: d.publicado,
      autorId: d.autorId,
      criadoEm: d.criadoEm,
    }
  }
}
