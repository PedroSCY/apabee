import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsUUID, Min } from 'class-validator'

export class AdicionarComposicaoDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID do tipo de matéria-prima' })
  @IsUUID()
  tipoMateriaPrimaId!: string

  @ApiProperty({ example: 0.5, description: 'Quantidade necessária por unidade de produto' })
  @IsNumber()
  @Min(0.001)
  quantidadeNecessaria!: number
}
