import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CategoriaCusto } from '@apa/shared'

export class RegistrarCustoDto {
  @ApiProperty({ example: 'Embalagens de vidro' })
  @IsString()
  @MinLength(3)
  descricao!: string

  @ApiProperty({ example: 350 })
  @IsNumber()
  @IsPositive()
  valor!: number

  @ApiProperty({ enum: CategoriaCusto })
  @IsEnum(CategoriaCusto)
  categoria!: CategoriaCusto

  @ApiPropertyOptional({ example: 'uuid-do-associado', description: 'Associado que adiantou o pagamento (RN27)' })
  @IsOptional()
  @IsUUID()
  pagoPorId?: string

  @ApiPropertyOptional({ example: 'https://bucket/comprovante.jpg' })
  @IsOptional()
  @IsString()
  comprovanteUrl?: string
}
