import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class AtualizarSenhaDto {
  @ApiProperty({ example: 'NovaSenha@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  senha!: string
}
