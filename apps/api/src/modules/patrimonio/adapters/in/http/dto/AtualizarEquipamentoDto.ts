import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class AtualizarEquipamentoDto {
  @ApiPropertyOptional({ example: 'Centrífuga radial 12 quadros' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome?: string

  @ApiPropertyOptional({ example: 'SN-2024-002' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  numeroSerie?: string

  @ApiPropertyOptional({ example: 'Descrição atualizada' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string
}
