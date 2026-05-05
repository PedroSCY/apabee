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
import { RoleUsuario } from '@apa/shared'
import {
  Aviso,
  IDespublicarAvisoUseCase,
  IExcluirAvisoUseCase,
  ICriarAvisoUseCase,
  IListarAvisosUseCase,
  IPublicarAvisoUseCase,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarAvisoDto } from './dto/CriarAvisoDto'
import {
  CRIAR_AVISO_USE_CASE,
  DESPUBLICAR_AVISO_USE_CASE,
  EXCLUIR_AVISO_USE_CASE,
  LISTAR_AVISOS_USE_CASE,
  PUBLICAR_AVISO_USE_CASE,
} from '../../../comunicacao.tokens'

@ApiTags('Comunicação')
@ApiBearerAuth('JWT')
@Controller('comunicacao/avisos')
export class AvisosController {
  constructor(
    @Inject(CRIAR_AVISO_USE_CASE) private readonly criar: ICriarAvisoUseCase,
    @Inject(LISTAR_AVISOS_USE_CASE) private readonly listar: IListarAvisosUseCase,
    @Inject(PUBLICAR_AVISO_USE_CASE) private readonly publicar: IPublicarAvisoUseCase,
    @Inject(DESPUBLICAR_AVISO_USE_CASE) private readonly despublicar: IDespublicarAvisoUseCase,
    @Inject(EXCLUIR_AVISO_USE_CASE) private readonly excluir: IExcluirAvisoUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar aviso (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Aviso criado.' })
  @Post()
  @Roles(RoleUsuario.ADMIN)
  async criarHandler(@Body() dto: CriarAvisoDto) {
    return this.toResponse(await this.criar.execute(dto))
  }

  @ApiOperation({ summary: 'Listar avisos' })
  @ApiQuery({ name: 'publicos', required: false, type: Boolean, description: 'true = apenas publicados' })
  @Get()
  async listarHandler(
    @Query('publicos') publicos?: string,
    @Request() req?: { user?: { role?: string } },
  ) {
    const isAdmin = req?.user?.role === RoleUsuario.ADMIN
    const apenasPublicados = !isAdmin || publicos === 'true'
    const lista = await this.listar.execute(apenasPublicados)
    return lista.map((a) => this.toResponse(a))
  }

  @ApiOperation({ summary: 'Publicar aviso (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do aviso' })
  @Patch(':id/publicar')
  @Roles(RoleUsuario.ADMIN)
  async publicarHandler(@Param('id') id: string) {
    return this.toResponse(await this.publicar.execute(id))
  }

  @ApiOperation({ summary: 'Despublicar aviso (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do aviso' })
  @Patch(':id/despublicar')
  @Roles(RoleUsuario.ADMIN)
  async despublicarHandler(@Param('id') id: string) {
    return this.toResponse(await this.despublicar.execute(id))
  }

  @ApiOperation({ summary: 'Excluir aviso (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do aviso' })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleUsuario.ADMIN)
  async excluirHandler(@Param('id') id: string) {
    await this.excluir.execute(id)
  }

  private toResponse(a: Aviso) {
    return {
      id: a.id,
      titulo: a.titulo,
      conteudo: a.conteudo,
      categoria: a.categoria,
      publicado: a.publicado,
      fixado: a.fixado,
      criadoEm: a.criadoEm,
    }
  }
}
