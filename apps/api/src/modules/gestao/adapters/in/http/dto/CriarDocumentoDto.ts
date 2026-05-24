import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { CategoriaDocumento } from '@apa/shared'

export class CriarDocumentoDto {
  @ApiProperty({ example: 'Estatuto Social da APA — 2025', description: 'Título do documento' })
  @IsString() @IsNotEmpty()
  titulo!: string

  @ApiProperty({ enum: CategoriaDocumento, example: CategoriaDocumento.RELATORIO, description: 'Categoria do documento' })
  @IsEnum(CategoriaDocumento)
  categoria!: CategoriaDocumento

  @ApiProperty({ example: 'https://storage.supabase.co/.../estatuto.pdf', description: 'URL pública do arquivo no Supabase Storage' })
  @IsString() @IsNotEmpty()
  arquivoUrl!: string

  @ApiProperty({ example: 204800, description: 'Tamanho do arquivo em bytes' })
  @IsNumber()
  tamanhoBytes!: number

  @ApiPropertyOptional({ example: false, description: 'Se true, publica imediatamente; caso contrário fica como rascunho' })
  @IsBoolean() @IsOptional()
  publicado?: boolean
}
