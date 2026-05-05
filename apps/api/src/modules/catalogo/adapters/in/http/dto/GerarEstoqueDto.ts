import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'

export class GerarEstoqueDto {
  @ApiProperty({ example: 10, description: 'Quantidade de unidades a produzir' })
  @IsInt()
  @Min(1)
  quantidade!: number
}
