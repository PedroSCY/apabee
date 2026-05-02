import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { RoleUsuario } from '@apa/shared'

export class CriarUsuarioDto {
  @ApiProperty({ example: 'João Silva', minLength: 2 })
  @IsString()
  @MinLength(2)
  nome!: string

  @ApiProperty({ example: 'joao.silva@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ enum: RoleUsuario, example: RoleUsuario.ASSOCIADO })
  @IsEnum(RoleUsuario)
  role!: RoleUsuario

  @ApiPropertyOptional({ example: '83999990000' })
  @IsOptional()
  @IsString()
  telefone?: string
}
