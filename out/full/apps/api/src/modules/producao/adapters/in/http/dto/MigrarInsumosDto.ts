import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsUUID } from 'class-validator'

export class MigrarInsumosDto {
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('all', { each: true })
  tipoMateriaPrimaIds!: string[]
}
