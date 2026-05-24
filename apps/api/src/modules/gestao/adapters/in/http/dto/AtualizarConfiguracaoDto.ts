import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator'

export class AtualizarConfiguracaoDto {
  @ApiPropertyOptional({ example: 'Associação Pratense de Apicultura', description: 'Nome de exibição da associação' })
  @IsString() @IsOptional() nomeExibido?: string

  @ApiPropertyOptional({ example: '00.000.000/0001-00', description: 'CNPJ da associação' })
  @IsString() @IsOptional() cnpj?: string

  @ApiPropertyOptional({ example: 'contato@apabee.org.br' })
  @IsString() @IsOptional() email?: string

  @ApiPropertyOptional({ example: '83999990000' })
  @IsString() @IsOptional() telefone?: string

  @ApiPropertyOptional({ example: 'Rua das Flores, 123 — Prata, PB' })
  @IsString() @IsOptional() endereco?: string

  @ApiPropertyOptional({ example: '#FAF6F0', description: 'Cor de fundo (CSS hex)' })
  @IsString() @IsOptional() corFundo?: string

  @ApiPropertyOptional({ example: '#3D2B1F', description: 'Cor do texto principal (CSS hex)' })
  @IsString() @IsOptional() corTexto?: string

  @ApiPropertyOptional({ example: '#D4860B', description: 'Cor primária / âmbar (CSS hex)' })
  @IsString() @IsOptional() corPrimaria?: string

  @ApiPropertyOptional({ example: '#FFFFFF', description: 'Cor do texto sobre a cor primária (CSS hex)' })
  @IsString() @IsOptional() corPrimariaForeground?: string

  @ApiPropertyOptional({ example: '#F5EFE6', description: 'Cor de fundo da sidebar (CSS hex)' })
  @IsString() @IsOptional() corSidebar?: string

  @ApiPropertyOptional({ example: '#7C4A00', description: 'Cor de destaque / accent (CSS hex)' })
  @IsString() @IsOptional() corAccent?: string

  @ApiPropertyOptional({ example: 50.0, description: 'Valor padrão da mensalidade em R$' })
  @IsNumber() @Min(0) @IsOptional() valorMensalidade?: number

  @ApiPropertyOptional({ example: 10, description: 'Dia de vencimento da mensalidade (1–28)' })
  @IsInt() @Min(1) @Max(28) @IsOptional() diaVencimento?: number
}
