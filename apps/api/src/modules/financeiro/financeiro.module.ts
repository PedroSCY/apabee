import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from '../../shared/database/prisma.module'
import { IdentidadeModule } from '../identidade/identidade.module'
import { GestaoModule } from '../gestao/gestao.module'
import { PrismaMensalidadeRepository } from './adapters/out/persistence/PrismaMensalidadeRepository'
import { PrismaMovimentoFinanceiroRepository } from '../producao/adapters/out/persistence/PrismaMovimentoFinanceiroRepository'
import { AsaasPaymentGateway } from './adapters/out/external/AsaasPaymentGateway'
import { InfinityPayCheckoutGateway } from './adapters/out/external/InfinityPayCheckoutGateway'
import { MercadoPagoGateway } from './adapters/out/external/MercadoPagoGateway'
import { MensalidadesController } from './adapters/in/http/MensalidadesController'
import { MeuFinanceiroController } from './adapters/in/http/MeuFinanceiroController'
import { MovimentosController } from './adapters/in/http/MovimentosController'
import { WebhooksController } from './adapters/in/http/WebhooksController'
import { GerarMensalidadesUseCase } from './application/use-cases/GerarMensalidadesUseCase'
import { QuitarMensalidadeUseCase } from './application/use-cases/QuitarMensalidadeUseCase'
import { MarcarIsentoMensalidadeUseCase } from './application/use-cases/MarcarIsentoMensalidadeUseCase'
import { ReativarMensalidadeUseCase } from './application/use-cases/ReativarMensalidadeUseCase'
import { ListarMensalidadesUseCase } from './application/use-cases/ListarMensalidadesUseCase'
import { ListarMensalidadesPorAssociadoUseCase } from './application/use-cases/ListarMensalidadesPorAssociadoUseCase'
import { EmitirCobrancaMensalidadeUseCase } from './application/use-cases/EmitirCobrancaMensalidadeUseCase'
import { CancelarCobrancaUseCase } from './application/use-cases/CancelarCobrancaUseCase'
import { EstornarMensalidadeUseCase } from './application/use-cases/EstornarMensalidadeUseCase'
import { ExcluirMensalidadeUseCase } from './application/use-cases/ExcluirMensalidadeUseCase'
import { ListarMovimentosUseCase } from './application/use-cases/ListarMovimentosUseCase'
import { ObterDashboardFinanceiroUseCase } from './application/use-cases/ObterDashboardFinanceiroUseCase'
import { RegistrarMovimentoUseCase } from './application/use-cases/RegistrarMovimentoUseCase'
import { RelatorioFinanceiroService } from './adapters/out/RelatorioFinanceiroService'
import { ReconciliacaoWebhookJob } from './application/jobs/ReconciliacaoWebhookJob'
import {
  MENSALIDADE_REPOSITORY,
  MOVIMENTO_FINANCEIRO_REPOSITORY,
  PAYMENT_GATEWAY,
  GERAR_MENSALIDADES_USE_CASE,
  QUITAR_MENSALIDADE_USE_CASE,
  MARCAR_ISENTO_MENSALIDADE_USE_CASE,
  REATIVAR_MENSALIDADE_USE_CASE,
  LISTAR_MENSALIDADES_USE_CASE,
  LISTAR_MENSALIDADES_POR_ASSOCIADO_USE_CASE,
  EMITIR_COBRANCA_USE_CASE,
  CANCELAR_COBRANCA_USE_CASE,
  ESTORNAR_MENSALIDADE_USE_CASE,
  EXCLUIR_MENSALIDADE_USE_CASE,
  LISTAR_MOVIMENTOS_USE_CASE,
  OBTER_DASHBOARD_FINANCEIRO_USE_CASE,
  REGISTRAR_MOVIMENTO_USE_CASE,
} from './financeiro.tokens'

@Module({
  imports: [ConfigModule, PrismaModule, IdentidadeModule, GestaoModule],
  controllers: [MensalidadesController, MeuFinanceiroController, MovimentosController, WebhooksController],
  providers: [
    // Repositories
    { provide: MENSALIDADE_REPOSITORY, useClass: PrismaMensalidadeRepository },
    { provide: MOVIMENTO_FINANCEIRO_REPOSITORY, useClass: PrismaMovimentoFinanceiroRepository },

    {
      provide: PAYMENT_GATEWAY,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('PAYMENT_GATEWAY_PROVIDER') ?? 'mercadopago'
        if (provider === 'infinitypay') return new InfinityPayCheckoutGateway(config)
        if (provider === 'asaas') return new AsaasPaymentGateway(config)
        return new MercadoPagoGateway(config)
      },
      inject: [ConfigService],
    },

    // Use cases — Etapa 13 (fluxo manual)
    { provide: GERAR_MENSALIDADES_USE_CASE, useClass: GerarMensalidadesUseCase },
    { provide: QUITAR_MENSALIDADE_USE_CASE, useClass: QuitarMensalidadeUseCase },
    { provide: MARCAR_ISENTO_MENSALIDADE_USE_CASE, useClass: MarcarIsentoMensalidadeUseCase },
    { provide: REATIVAR_MENSALIDADE_USE_CASE, useClass: ReativarMensalidadeUseCase },
    { provide: LISTAR_MENSALIDADES_USE_CASE, useClass: ListarMensalidadesUseCase },
    { provide: LISTAR_MENSALIDADES_POR_ASSOCIADO_USE_CASE, useClass: ListarMensalidadesPorAssociadoUseCase },

    // Use cases — Fase Asaas (pagamento online)
    { provide: EMITIR_COBRANCA_USE_CASE, useClass: EmitirCobrancaMensalidadeUseCase },
    { provide: CANCELAR_COBRANCA_USE_CASE, useClass: CancelarCobrancaUseCase },
    { provide: ESTORNAR_MENSALIDADE_USE_CASE, useClass: EstornarMensalidadeUseCase },
    { provide: EXCLUIR_MENSALIDADE_USE_CASE, useClass: ExcluirMensalidadeUseCase },
    { provide: LISTAR_MOVIMENTOS_USE_CASE, useClass: ListarMovimentosUseCase },
    { provide: OBTER_DASHBOARD_FINANCEIRO_USE_CASE, useClass: ObterDashboardFinanceiroUseCase },
    { provide: REGISTRAR_MOVIMENTO_USE_CASE, useClass: RegistrarMovimentoUseCase },

    RelatorioFinanceiroService,
    ReconciliacaoWebhookJob,
  ],
  exports: [PAYMENT_GATEWAY],
})
/** Módulo financeiro — mensalidades, movimentos e pagamentos online via Asaas. */
export class FinanceiroModule {}
