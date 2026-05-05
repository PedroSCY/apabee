import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { CategoriaAviso } from '@apa/shared'

export class CriarAvisoDto {
  @ApiProperty({ example: 'Reunião ordinária — Junho 2025' })
  @IsString()
  @MinLength(3)
  titulo!: string

  @ApiProperty({ example: 'Informamos que a reunião acontecerá...' })
  @IsString()
  @MinLength(10)
  conteudo!: string

  @ApiProperty({ enum: CategoriaAviso, default: CategoriaAviso.GERAL })
  @IsEnum(CategoriaAviso)
  categoria!: CategoriaAviso

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  fixado?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  publicado?: boolean
}
