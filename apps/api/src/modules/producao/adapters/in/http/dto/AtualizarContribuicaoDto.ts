import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class AtualizarContribuicaoDto {
  @ApiPropertyOptional({ example: 250.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorMonetario?: number

  @ApiPropertyOptional({ example: 'Ajudei na rotulagem de 300 potes' })
  @IsOptional()
  @IsString()
  descricao?: string
}
