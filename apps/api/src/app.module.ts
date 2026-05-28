import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { validateEnv } from './shared/config/env.validation'
import { SharedModule } from './shared/shared.module'
import { SseModule } from './shared/sse/sse.module'
import { IdentidadeModule } from './modules/identidade/identidade.module'
import { PatrimonioModule } from './modules/patrimonio/patrimonio.module'
import { ProducaoModule } from './modules/producao/producao.module'
import { GestaoModule } from './modules/gestao/gestao.module'
import { CatalogoModule } from './modules/catalogo/catalogo.module'
import { ComercialModule } from './modules/comercial/comercial.module'
import { ComunicacaoModule } from './modules/comunicacao/comunicacao.module'
import { FinanceiroModule } from './modules/financeiro/financeiro.module'
import { NotificacaoModule } from './modules/notificacao/notificacao.module'
import { LojaModule } from './modules/loja/loja.module'
import { JwtAuthGuard, RolesGuard } from './shared/guards'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    ScheduleModule.forRoot(),
    SharedModule,
    SseModule,
    IdentidadeModule,
    PatrimonioModule,
    ProducaoModule,
    GestaoModule,
    CatalogoModule,
    ComercialModule,
    ComunicacaoModule,
    FinanceiroModule,
    NotificacaoModule,
    LojaModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
/** Módulo raiz da aplicação — importa todos os módulos de domínio e configurações globais. */
export class AppModule {}
