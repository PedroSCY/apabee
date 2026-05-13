import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator'
import { CategoriaInsumo } from '@apa/shared'

export class CriarTipoInsumoDto {
  @ApiProperty({ description: 'Nome do tipo de insumo (ex: Fumigador)' })
  @IsString()
  @MaxLength(120)
  nome!: string

  @ApiProperty({ enum: CategoriaInsumo, description: 'Categoria' })
  @IsEnum(CategoriaInsumo)
  categoria!: CategoriaInsumo

  @ApiProperty({ description: 'Sigla para geração de identificador (ex: FUM)', example: 'FUM' })
  @IsString()
  @Length(2, 6)
  sigla!: string

  @ApiPropertyOptional({ description: 'Descrição opcional' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string
}

export class AtualizarTipoInsumoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 6)
  sigla?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string
}

export class AdicionarUnidadesDto {
  @ApiProperty({ description: 'Quantidade de unidades a adicionar (1–100)', example: 5 })
  @IsInt()
  @Min(1)
  @Max(100)
  quantidade!: number

  @ApiPropertyOptional({ description: 'Descrição opcional para as unidades' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string
}
