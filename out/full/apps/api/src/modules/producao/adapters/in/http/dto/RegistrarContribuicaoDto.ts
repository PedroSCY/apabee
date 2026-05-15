import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RegraAcordo, TipoContribuicao } from '@apa/shared'

export class RegistrarContribuicaoDto {
  @ApiProperty({ example: 'uuid-do-associado' })
  @IsUUID()
  associadoId!: string

  @ApiProperty({ enum: TipoContribuicao })
  @IsEnum(TipoContribuicao)
  tipo!: TipoContribuicao

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsPositive()
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
  @IsNumber()
  horas?: number

  @ApiPropertyOptional({ enum: RegraAcordo })
  @IsOptional()
  @IsEnum(RegraAcordo)
  regraCalculo?: RegraAcordo

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  regraParametro?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string
}
