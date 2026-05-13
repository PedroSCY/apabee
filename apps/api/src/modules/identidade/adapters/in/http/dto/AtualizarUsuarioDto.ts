import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'
import { RoleUsuario } from '@apa/shared'

export class AtualizarUsuarioDto {
  @ApiPropertyOptional({ example: 'João da Silva' })
  @IsOptional()
  @IsString()
  nome?: string

  @ApiPropertyOptional({ example: 'joao@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ enum: RoleUsuario })
  @IsOptional()
  @IsEnum(RoleUsuario)
  role?: RoleUsuario
}
