import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator'

export class AprovarAssociadoPendenteDto {
  @ApiProperty({ example: 'SenhaInicial@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  senha!: string

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Data de ingresso. Se omitida, usa a data atual.' })
  @IsOptional()
  @IsDateString()
  dataIngresso?: string
}
