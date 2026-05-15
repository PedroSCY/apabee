import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'

export class ItemPedidoDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsUUID()
  produtoId!: string

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantidade!: number
}

export class CriarPedidoDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  clienteNome!: string

  @ApiProperty({ example: 'joao@exemplo.com' })
  @IsEmail()
  clienteEmail!: string

  @ApiPropertyOptional({ example: '(34) 99999-0000' })
  @IsOptional()
  @IsString()
  clienteTelefone?: string

  @ApiProperty({ type: [ItemPedidoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens!: ItemPedidoDto[]
}
