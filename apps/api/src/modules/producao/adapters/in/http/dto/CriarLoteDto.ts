import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
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
}
