import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class AdicionarItemAquisicaoDto {
  @ApiProperty({ example: 'Caixa de colmeia Langstroth' })
  @IsString()
  nome!: string

  @ApiProperty({ example: 350.0 })
  @IsNumber()
  @Min(0)
  precoUnitario!: number

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  quantidadeMeta!: number

  @ApiProperty({ example: 'unid' })
  @IsString()
  unidade!: string

  @ApiPropertyOptional({ example: 'uuid-do-tipo-destino' })
  @IsOptional()
  @IsString()
  tipoDestinoId?: string
}
