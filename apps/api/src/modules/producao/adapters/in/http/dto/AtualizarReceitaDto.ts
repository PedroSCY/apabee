import { IsNumber, IsPositive } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AtualizarReceitaDto {
  @ApiProperty({ example: 15000.00, description: 'Receita total da campanha em R$' })
  @IsNumber()
  @IsPositive()
  receitaTotal!: number
}
