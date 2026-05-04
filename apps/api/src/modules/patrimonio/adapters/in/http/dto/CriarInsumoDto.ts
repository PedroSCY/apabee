import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { CategoriaInsumo } from '@apa/shared'

export class CriarInsumoDto {
  @ApiProperty({ example: 'Fumigador' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string

  @ApiProperty({ enum: CategoriaInsumo, example: CategoriaInsumo.FERRAMENTA })
  @IsEnum(CategoriaInsumo)
  categoria: CategoriaInsumo

  @ApiPropertyOptional({ example: 'Fumigador metálico com fole de couro' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string
}
