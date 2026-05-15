import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { TipoDestinoAquisicao } from '@apa/shared'

export class AtualizarItemAquisicaoDto {
  @ApiPropertyOptional({ example: 'Centrífuga Elétrica 20 quadros — modelo atualizado' })
  @IsOptional()
  @IsString()
  descricao?: string

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade?: number

  @ApiPropertyOptional({ example: 4800.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorEstimado?: number

  @ApiPropertyOptional({ enum: TipoDestinoAquisicao })
  @IsOptional()
  @IsEnum(TipoDestinoAquisicao)
  tipoDestino?: TipoDestinoAquisicao

  @ApiPropertyOptional({ example: 'Centrífuga Inox Premium' })
  @IsOptional()
  @IsString()
  equipamentoNome?: string

  @ApiPropertyOptional({ example: 'uuid-do-tipo-materia-prima' })
  @IsOptional()
  @IsString()
  tipoMateriaPrimaId?: string
}
