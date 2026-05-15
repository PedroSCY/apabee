import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CriarSafraDto {
  @ApiProperty({ example: 'Safra Laranjeira 2025' })
  @IsString()
  @MinLength(3)
  nome!: string

  @ApiProperty({ example: 'uuid-da-florada' })
  @IsString()
  @IsUUID()
  floradaId!: string

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  dataInicio!: string

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  dataFim?: string
}
