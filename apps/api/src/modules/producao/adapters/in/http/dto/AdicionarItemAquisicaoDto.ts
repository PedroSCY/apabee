import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { TipoDestinoAquisicao } from '@apa/shared'

export class AdicionarItemAquisicaoDto {
  @ApiProperty({ example: 'Centrífuga Elétrica 20 quadros' })
  @IsString()
  descricao!: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantidade!: number

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @Min(0)
  valorEstimado!: number

  @ApiProperty({ enum: TipoDestinoAquisicao })
  @IsEnum(TipoDestinoAquisicao)
  tipoDestino!: TipoDestinoAquisicao

  @ApiPropertyOptional({ example: 'Centrífuga Inox' })
  @IsOptional()
  @IsString()
  equipamentoNome?: string

  @ApiPropertyOptional({ example: 'uuid-do-tipo-materia-prima' })
  @IsOptional()
  @IsString()
  tipoMateriaPrimaId?: string
}
