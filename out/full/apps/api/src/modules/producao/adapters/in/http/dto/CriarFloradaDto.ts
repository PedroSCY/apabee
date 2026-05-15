import { IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CriarFloradaDto {
  @ApiProperty({ example: 'Laranjeira' })
  @IsString()
  @MinLength(2)
  nome!: string

  @ApiPropertyOptional({ example: 'Florada de laranjeira, mel claro e aromático' })
  @IsOptional()
  @IsString()
  descricao?: string
}
