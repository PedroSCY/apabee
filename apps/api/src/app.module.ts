import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { validateEnv } from './shared/config/env.validation'
import { SharedModule } from './shared/shared.module'
import { IdentidadeModule } from './modules/identidade/identidade.module'
import { JwtAuthGuard, RolesGuard } from './shared/guards'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    SharedModule,
    IdentidadeModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
