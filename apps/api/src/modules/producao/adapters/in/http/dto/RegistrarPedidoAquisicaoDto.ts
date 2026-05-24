import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator'
import { OrigemContribuicao } from '@apa/shared'

export class RegistrarPedidoAquisicaoDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID do item de aquisição' })
  @IsUUID()
  itemAquisicaoId!: string

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'UUID do associado (obrigatório se origem = ASSOCIADO)' })
  @IsOptional()
  @IsUUID()
  associadoId?: string

  @ApiProperty({ enum: OrigemContribuicao, example: OrigemContribuicao.ASSOCIADO, description: 'ASSOCIADO = compra individual; RECURSO_PROPRIO = caixa da APA' })
  @IsEnum(OrigemContribuicao)
  origem!: OrigemContribuicao

  @ApiProperty({ example: 10, description: 'Quantidade pedida (unidades)' })
  @IsInt()
  @Min(1)
  quantidade!: number
}
