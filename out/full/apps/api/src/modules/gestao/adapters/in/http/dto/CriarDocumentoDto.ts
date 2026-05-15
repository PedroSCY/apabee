import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { CategoriaDocumento } from '@apa/shared'

export class CriarDocumentoDto {
  @IsString() @IsNotEmpty()
  titulo!: string

  @IsEnum(CategoriaDocumento)
  categoria!: CategoriaDocumento

  @IsString() @IsNotEmpty()
  arquivoUrl!: string

  @IsNumber()
  tamanhoBytes!: number

  @IsBoolean() @IsOptional()
  publicado?: boolean
}
