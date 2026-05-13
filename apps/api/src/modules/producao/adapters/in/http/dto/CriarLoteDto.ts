import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoLote } from '@apa/shared'

export class CriarLoteDto {
  @ApiProperty({ enum: TipoLote })
  @IsEnum(TipoLote)
  tipo!: TipoLote

  @ApiProperty({ example: '2025-01' })
  @IsString()
  @MinLength(4)
  periodo!: string

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  dataInicio!: string

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Data de encerramento planejada. Se omitida, o lote é encerrado manualmente.' })
  @IsOptional()
  @IsDateString()
  dataFim?: string
}
