import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CriarEquipamentoDto {
  @ApiProperty({ example: 'Centrífuga radial 9 quadros' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string

  @ApiPropertyOptional({ example: 'SN-2024-001' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  numeroSerie?: string

  @ApiPropertyOptional({ example: 'Centrífuga elétrica para extração de mel' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string
}
