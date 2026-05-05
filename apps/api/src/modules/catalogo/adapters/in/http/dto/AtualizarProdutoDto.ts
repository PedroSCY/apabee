import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator'

export class AtualizarProdutoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  descricao?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  preco?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string
}
