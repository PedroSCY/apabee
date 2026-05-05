import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator'

export class CriarProdutoDto {
  @ApiProperty({ example: 'Mel Silvestre 500g' })
  @IsString()
  @MinLength(2)
  nome!: string

  @ApiPropertyOptional({ example: 'mel-silvestre-500g', description: 'Gerado automaticamente se omitido' })
  @IsOptional()
  @IsString()
  slug?: string

  @ApiProperty({ example: 'Mel puro de florada silvestre, colhido por apicultores da APA.' })
  @IsString()
  @MinLength(10)
  descricao!: string

  @ApiProperty({ example: 28.5 })
  @IsNumber()
  @IsPositive()
  preco!: number

  @ApiPropertyOptional({ example: 'https://storage.example.com/mel.jpg' })
  @IsOptional()
  @IsString()
  imagemUrl?: string

  @ApiPropertyOptional({ description: 'UUID do lote de origem (batch)' })
  @IsOptional()
  @IsUUID()
  loteOrigemId?: string
}
