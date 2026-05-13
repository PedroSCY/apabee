import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class CriarAssociadoPendenteDto {
  @ApiProperty({ example: 'João Silva', minLength: 2 })
  @IsString()
  @MinLength(2)
  nome!: string

  @ApiProperty({ example: 'joao.silva@example.com' })
  @IsEmail()
  email!: string

  @ApiPropertyOptional({ example: '83999990000' })
  @IsOptional()
  @IsString()
  telefone?: string

  @ApiPropertyOptional({ example: 'Indicado por Maria.' })
  @IsOptional()
  @IsString()
  observacoes?: string
}
