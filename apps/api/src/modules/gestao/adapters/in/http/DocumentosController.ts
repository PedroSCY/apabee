import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common'
import { Roles } from '../../../../../shared/guards'
import { CategoriaDocumento, RoleUsuario } from '@apa/shared'
import {
  ICriarDocumentoUseCase,
  IListarDocumentosUseCase,
  IPublicarDocumentoUseCase,
  IDespublicarDocumentoUseCase,
  IExcluirDocumentoUseCase,
} from '@apa/core'
import {
  CRIAR_DOCUMENTO_USE_CASE,
  LISTAR_DOCUMENTOS_USE_CASE,
  PUBLICAR_DOCUMENTO_USE_CASE,
  DESPUBLICAR_DOCUMENTO_USE_CASE,
  EXCLUIR_DOCUMENTO_USE_CASE,
} from '../../../gestao.tokens'
import { CriarDocumentoDto } from './dto/CriarDocumentoDto'

@Controller('gestao/documentos')
export class DocumentosController {
  constructor(
    @Inject(CRIAR_DOCUMENTO_USE_CASE) private readonly criarDoc: ICriarDocumentoUseCase,
    @Inject(LISTAR_DOCUMENTOS_USE_CASE) private readonly listarDocs: IListarDocumentosUseCase,
    @Inject(PUBLICAR_DOCUMENTO_USE_CASE) private readonly publicarDoc: IPublicarDocumentoUseCase,
    @Inject(DESPUBLICAR_DOCUMENTO_USE_CASE) private readonly despublicarDoc: IDespublicarDocumentoUseCase,
    @Inject(EXCLUIR_DOCUMENTO_USE_CASE) private readonly excluirDoc: IExcluirDocumentoUseCase,
  ) {}

  @Post()
  @Roles(RoleUsuario.ADMIN)
  async criar(@Body() dto: CriarDocumentoDto, @Request() req: { user: { sub: string } }) {
    return this.criarDoc.execute({
      titulo: dto.titulo,
      categoria: dto.categoria,
      arquivoUrl: dto.arquivoUrl,
      tamanhoBytes: dto.tamanhoBytes,
      autorId: req.user.sub,
      publicado: dto.publicado,
    })
  }

  @Get()
  async listar(
    @Query('categoria') categoria?: string,
    @Request() req?: { user: { role: string } },
  ) {
    const cat = categoria as CategoriaDocumento | undefined
    const apenasPublicados = req?.user?.role !== RoleUsuario.ADMIN
    return this.listarDocs.execute(cat, apenasPublicados)
  }

  @Patch(':id/publicar')
  @Roles(RoleUsuario.ADMIN)
  async publicar(@Param('id') id: string) {
    return this.publicarDoc.execute(id)
  }

  @Patch(':id/despublicar')
  @Roles(RoleUsuario.ADMIN)
  async despublicar(@Param('id') id: string) {
    return this.despublicarDoc.execute(id)
  }

  @Delete(':id')
  @Roles(RoleUsuario.ADMIN)
  async excluir(@Param('id') id: string) {
    await this.excluirDoc.execute(id)
  }
}
