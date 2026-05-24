import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'

export class MarcarIsentoDto {
  @ApiPropertyOptional({ example: 'Associado em dificuldade financeira temporária', description: 'Motivo da isenção pontual desta competência' })
  @IsString() @IsOptional() motivo?: string
}
