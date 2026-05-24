import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './guards'
import { AuditService } from './audit/audit.service'
import { PrismaModule } from './database/prisma.module'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    PrismaModule,
  ],
  providers: [JwtStrategy, AuditService],
  exports: [JwtModule, PassportModule, AuditService],
})
/** Módulo compartilhado que expõe autenticação JWT e estratégia Passport. */
export class SharedModule {}
