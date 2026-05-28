import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { CatalogoModule } from '../catalogo/catalogo.module'
import { FinanceiroModule } from '../financeiro/financeiro.module'
import { IdentidadeModule } from '../identidade/identidade.module'
import {
  ClienteLojaController,
  ConfiguracaoLojaController,
  PedidoLojaController,
  WebhookLojaController,
} from './adapters/in/http'
import {
  PrismaClienteRepository,
  PrismaConfiguracaoLojaRepository,
  PrismaPedidoLojaRepository,
} from './adapters/out/persistence'
import { ReconciliacaoLojaJob } from './application/jobs/ReconciliacaoLojaJob'
import {
  AprovarCancelamentoPedidoLojaUseCase,
  AtualizarClienteUseCase,
  AtualizarConfiguracaoLojaUseCase,
  AtualizarEnderecoUseCase,
  AtualizarStatusPedidoLojaUseCase,
  CheckoutPedidoLojaUseCase,
  ConfirmarPagamentoPedidoLojaUseCase,
  CriarEnderecoUseCase,
  CriarOuSincronizarClienteUseCase,
  DefinirEnderecoPrincipalUseCase,
  ListarClientesUseCase,
  ListarEnderecosClienteUseCase,
  ListarPedidosClienteUseCase,
  ListarTodosPedidosLojaUseCase,
  ObterClienteUseCase,
  ObterConfiguracaoLojaUseCase,
  ObterPedidoLojaUseCase,
  RejeitarCancelamentoPedidoLojaUseCase,
  RemoverEnderecoUseCase,
  RenovarPixPedidoLojaUseCase,
  SolicitarCancelamentoPedidoLojaUseCase,
} from './application/use-cases'
import {
  APROVAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE,
  ATUALIZAR_CLIENTE_USE_CASE,
  ATUALIZAR_CONFIGURACAO_LOJA_USE_CASE,
  ATUALIZAR_ENDERECO_USE_CASE,
  ATUALIZAR_STATUS_PEDIDO_LOJA_USE_CASE,
  CHECKOUT_PEDIDO_LOJA_USE_CASE,
  CLIENTE_REPOSITORY,
  CONFIRMAR_PAGAMENTO_PEDIDO_LOJA_USE_CASE,
  CONFIGURACAO_LOJA_REPOSITORY,
  CRIAR_ENDERECO_USE_CASE,
  CRIAR_OU_SINCRONIZAR_CLIENTE_USE_CASE,
  DEFINIR_ENDERECO_PRINCIPAL_USE_CASE,
  LISTAR_CLIENTES_USE_CASE,
  LISTAR_ENDERECOS_USE_CASE,
  LISTAR_PEDIDOS_CLIENTE_USE_CASE,
  LISTAR_TODOS_PEDIDOS_LOJA_USE_CASE,
  OBTER_CLIENTE_USE_CASE,
  OBTER_CONFIGURACAO_LOJA_USE_CASE,
  OBTER_PEDIDO_LOJA_USE_CASE,
  PEDIDO_LOJA_REPOSITORY,
  REJEITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE,
  REMOVER_ENDERECO_USE_CASE,
  RENOVAR_PIX_PEDIDO_LOJA_USE_CASE,
  SOLICITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE,
} from './loja.tokens'

@Module({
  imports: [PrismaModule, CatalogoModule, FinanceiroModule, IdentidadeModule],
  controllers: [
    ClienteLojaController,
    PedidoLojaController,
    ConfiguracaoLojaController,
    WebhookLojaController,
  ],
  providers: [
    // Repositórios
    { provide: CLIENTE_REPOSITORY, useClass: PrismaClienteRepository },
    { provide: PEDIDO_LOJA_REPOSITORY, useClass: PrismaPedidoLojaRepository },
    { provide: CONFIGURACAO_LOJA_REPOSITORY, useClass: PrismaConfiguracaoLojaRepository },

    // Auth / Cliente
    { provide: CRIAR_OU_SINCRONIZAR_CLIENTE_USE_CASE, useClass: CriarOuSincronizarClienteUseCase },
    { provide: OBTER_CLIENTE_USE_CASE, useClass: ObterClienteUseCase },
    { provide: ATUALIZAR_CLIENTE_USE_CASE, useClass: AtualizarClienteUseCase },
    { provide: LISTAR_CLIENTES_USE_CASE, useClass: ListarClientesUseCase },

    // Endereços
    { provide: LISTAR_ENDERECOS_USE_CASE, useClass: ListarEnderecosClienteUseCase },
    { provide: CRIAR_ENDERECO_USE_CASE, useClass: CriarEnderecoUseCase },
    { provide: ATUALIZAR_ENDERECO_USE_CASE, useClass: AtualizarEnderecoUseCase },
    { provide: REMOVER_ENDERECO_USE_CASE, useClass: RemoverEnderecoUseCase },
    { provide: DEFINIR_ENDERECO_PRINCIPAL_USE_CASE, useClass: DefinirEnderecoPrincipalUseCase },

    // Pedidos
    { provide: CHECKOUT_PEDIDO_LOJA_USE_CASE, useClass: CheckoutPedidoLojaUseCase },
    { provide: LISTAR_PEDIDOS_CLIENTE_USE_CASE, useClass: ListarPedidosClienteUseCase },
    { provide: OBTER_PEDIDO_LOJA_USE_CASE, useClass: ObterPedidoLojaUseCase },
    { provide: CONFIRMAR_PAGAMENTO_PEDIDO_LOJA_USE_CASE, useClass: ConfirmarPagamentoPedidoLojaUseCase },
    { provide: RENOVAR_PIX_PEDIDO_LOJA_USE_CASE, useClass: RenovarPixPedidoLojaUseCase },
    { provide: SOLICITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE, useClass: SolicitarCancelamentoPedidoLojaUseCase },
    { provide: APROVAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE, useClass: AprovarCancelamentoPedidoLojaUseCase },
    { provide: REJEITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE, useClass: RejeitarCancelamentoPedidoLojaUseCase },
    { provide: LISTAR_TODOS_PEDIDOS_LOJA_USE_CASE, useClass: ListarTodosPedidosLojaUseCase },
    { provide: ATUALIZAR_STATUS_PEDIDO_LOJA_USE_CASE, useClass: AtualizarStatusPedidoLojaUseCase },

    // Configuração
    { provide: OBTER_CONFIGURACAO_LOJA_USE_CASE, useClass: ObterConfiguracaoLojaUseCase },
    { provide: ATUALIZAR_CONFIGURACAO_LOJA_USE_CASE, useClass: AtualizarConfiguracaoLojaUseCase },

    // Jobs
    ReconciliacaoLojaJob,
  ],
  exports: [CONFIRMAR_PAGAMENTO_PEDIDO_LOJA_USE_CASE, PEDIDO_LOJA_REPOSITORY],
})
export class LojaModule {}
