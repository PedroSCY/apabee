import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UnidadeMedida } from '@apa/shared'

export class CriarTipoMateriaPrimaDto {
  @ApiProperty({ example: 'Mel Silvestre' })
  @IsString()
  @MinLength(2)
  nome!: string

  @ApiProperty({ enum: UnidadeMedida })
  @IsEnum(UnidadeMedida)
  unidade!: UnidadeMedida

  @ApiPropertyOptional({ example: 'Mel produzido por abelhas silvestres' })
  @IsOptional()
  @IsString()
  descricao?: string
}
