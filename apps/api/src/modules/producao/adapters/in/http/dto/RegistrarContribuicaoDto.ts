import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoContribuicao } from '@apa/shared'

export class RegistrarContribuicaoDto {
  @ApiProperty({ example: 'uuid-do-associado' })
  @IsUUID()
  associadoId!: string

  @ApiProperty({ enum: TipoContribuicao })
  @IsEnum(TipoContribuicao)
  tipo!: TipoContribuicao

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0)
  valorMonetario!: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  colheitaId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  volume?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  tipoMateriaPrimaId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string
}
