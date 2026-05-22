import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class AtualizarItemAquisicaoDto {
  @ApiPropertyOptional({ example: 'Caixa de colmeia Langstroth — modelo atualizado' })
  @IsOptional()
  @IsString()
  nome?: string

  @ApiPropertyOptional({ example: 360.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoUnitario?: number

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidadeMeta?: number

  @ApiPropertyOptional({ example: 'unid' })
  @IsOptional()
  @IsString()
  unidade?: string

  @ApiPropertyOptional({ example: 'uuid-do-tipo-destino' })
  @IsOptional()
  @IsString()
  tipoDestinoId?: string
}
