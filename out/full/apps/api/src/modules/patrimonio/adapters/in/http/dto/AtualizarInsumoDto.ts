import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class AtualizarInsumoDto {
  @ApiPropertyOptional({ example: 'Fumigador elétrico' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome?: string

  @ApiPropertyOptional({ example: 'Descrição atualizada' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string
}
