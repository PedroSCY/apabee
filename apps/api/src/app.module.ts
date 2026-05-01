import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { SharedModule } from './shared/shared.module'
import { PrismaModule } from './shared/database/prisma.module'
import { JwtAuthGuard, RolesGuard } from './shared/guards'

@Module({
  imports: [SharedModule, PrismaModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
