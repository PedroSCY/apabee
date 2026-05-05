import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { CatalogoModule } from '../catalogo/catalogo.module'
import { PedidosController } from './adapters/in/http/PedidosController'
import { VendasController } from './adapters/in/http/VendasController'
import {
  PrismaItemPedidoRepository,
  PrismaPedidoRepository,
  PrismaVendaRepository,
} from './adapters/out/persistence'
import {
  BuscarPedidoUseCase,
  CancelarPedidoUseCase,
  ConfirmarPedidoUseCase,
  CriarPedidoUseCase,
  ListarPedidosUseCase,
  ListarVendasUseCase,
  MarcarEnviadoUseCase,
  RegistrarVendaUseCase,
} from './application/use-cases'
import {
  BUSCAR_PEDIDO_USE_CASE,
  CANCELAR_PEDIDO_USE_CASE,
  CONFIRMAR_PEDIDO_USE_CASE,
  CRIAR_PEDIDO_USE_CASE,
  ITEM_PEDIDO_REPOSITORY,
  LISTAR_PEDIDOS_USE_CASE,
  LISTAR_VENDAS_USE_CASE,
  MARCAR_ENVIADO_USE_CASE,
  PEDIDO_REPOSITORY,
  REGISTRAR_VENDA_USE_CASE,
  VENDA_REPOSITORY,
} from './comercial.tokens'

@Module({
  imports: [PrismaModule, CatalogoModule],
  controllers: [PedidosController, VendasController],
  providers: [
    { provide: PEDIDO_REPOSITORY, useClass: PrismaPedidoRepository },
    { provide: ITEM_PEDIDO_REPOSITORY, useClass: PrismaItemPedidoRepository },
    { provide: VENDA_REPOSITORY, useClass: PrismaVendaRepository },
    { provide: CRIAR_PEDIDO_USE_CASE, useClass: CriarPedidoUseCase },
    { provide: LISTAR_PEDIDOS_USE_CASE, useClass: ListarPedidosUseCase },
    { provide: BUSCAR_PEDIDO_USE_CASE, useClass: BuscarPedidoUseCase },
    { provide: CONFIRMAR_PEDIDO_USE_CASE, useClass: ConfirmarPedidoUseCase },
    { provide: CANCELAR_PEDIDO_USE_CASE, useClass: CancelarPedidoUseCase },
    { provide: MARCAR_ENVIADO_USE_CASE, useClass: MarcarEnviadoUseCase },
    { provide: REGISTRAR_VENDA_USE_CASE, useClass: RegistrarVendaUseCase },
    { provide: LISTAR_VENDAS_USE_CASE, useClass: ListarVendasUseCase },
  ],
})
export class ComercialModule {}
