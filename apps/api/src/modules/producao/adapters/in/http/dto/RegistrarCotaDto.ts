import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegistrarCotaDto {
  @ApiPropertyOptional({ example: 'uuid-do-associado', description: 'Obrigatório para cotas de associado; omitir para cota da APA (RECURSO_PROPRIO)' })
  @IsOptional()
  @IsUUID()
  associadoId?: string

  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsPositive()
  valor!: number
}
