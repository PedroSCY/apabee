'use client'

import { useParams } from 'next/navigation'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { usePedidoLoja, PEDIDO_LOJA_KEY, useCancelarPedidoLoja } from '@/hooks/useLoja'
import { PixPaymentScreen } from '@/components/shop/PixPaymentScreen'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando pagamento', className: 'bg-amber-100 text-amber-700 border-amber-300' },
  PAGO: { label: 'Pago', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  EM_PREPARACAO: { label: 'Em preparação', className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  SAIU_ENTREGA: { label: 'Saiu para entrega', className: 'bg-purple-100 text-purple-700 border-purple-300' },
  ENTREGUE: { label: 'Entregue', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  CANCELADO: { label: 'Cancelado', className: 'bg-red-100 text-red-700 border-red-300' },
  CANCELAMENTO_SOLICITADO: { label: 'Cancelamento solicitado', className: 'bg-orange-100 text-orange-700 border-orange-300' },
}

const ENTREGA_LABEL: Record<string, string> = {
  PRATA_GRATIS: 'Entrega em Prata - PB (Grátis)',
  RETIRADA_LOCAL: 'Retirada na sede da APA',
  A_COMBINAR: 'Outra cidade — A combinar',
  CORREIOS: 'Correios',
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** Botão de cancelamento com AlertDialog de confirmação */
function CancelButton({ pedidoId, status, isPago, valorTotal }: { pedidoId: string; status: string; isPago: boolean; valorTotal: number }) {
  const cancelar = useCancelarPedidoLoja()

  async function handleCancelar() {
    try {
      await cancelar.mutateAsync(pedidoId)
      toast.success(isPago
        ? 'Solicitação de cancelamento enviada. Nossa equipe analisará em breve.'
        : 'Pedido cancelado com sucesso.')
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao cancelar pedido.')
    }
  }

  // Apenas AGUARDANDO_PAGAMENTO e PAGO são canceláveis pelo cliente
  if (!['AGUARDANDO_PAGAMENTO', 'PAGO'].includes(status)) return null

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={cancelar.isPending}>
          Cancelar pedido
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPago ? 'Solicitar cancelamento?' : 'Cancelar pedido?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPago
              ? `Seu pedido já foi pago (${fmt(valorTotal)}). A solicitação será enviada para nossa equipe, que analisará e processará o estorno caso aprovado.`
              : 'O pedido ainda não foi pago. O cancelamento é imediato e nenhuma cobrança será feita.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleCancelar}
          >
            {isPago ? 'Sim, solicitar cancelamento' : 'Sim, cancelar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const isAguardando = (pedido: any) => pedido?.status === 'AGUARDANDO_PAGAMENTO'

  const { data: pedido, isLoading } = usePedidoLoja(id, true)

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>
  if (!pedido) return <div className="p-6 text-center text-muted-foreground">Pedido não encontrado.</div>

  const statusCfg = STATUS_CONFIG[pedido.status] ?? { label: pedido.status, className: '' }
  const isPago = pedido.status === 'PAGO'

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/minha-conta/pedidos"><ArrowLeft className="h-4 w-4 mr-1" /> Meus pedidos</Link>
      </Button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-serif text-accent">Pedido #{pedido.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{fmtDate(pedido.criadoEm)}</p>
        </div>
        <Badge variant="outline" className={`text-xs px-2 py-1 ${statusCfg.className}`}>
          {statusCfg.label}
        </Badge>
      </div>

      {/* Banner de cancelamento solicitado */}
      {pedido.status === 'CANCELAMENTO_SOLICITADO' && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          ⏳ Sua solicitação de cancelamento foi recebida e está em análise. Você receberá um e-mail quando processada.
        </div>
      )}

      {/* PIX pendente */}
      {isAguardando(pedido) && pedido.metodoPagamento === 'PIX' && pedido.pixCopiaECola && (
        <Card>
          <CardContent className="pt-4">
            <PixPaymentScreen
              pedidoId={pedido.id}
              pixCopiaECola={pedido.pixCopiaECola}
              pixQrCodeBase64={pedido.pixQrCodeBase64}
              valorTotal={pedido.valorTotal}
              expiracaoEm={pedido.cobrancaExpiracaoEm!}
              onPago={() => {
                void qc.invalidateQueries({ queryKey: PEDIDO_LOJA_KEY(id) })
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Cartão em análise */}
      {isAguardando(pedido) && pedido.metodoPagamento === 'CARTAO' && (
        <Card className="border-amber-300">
          <CardContent className="pt-4 text-sm text-amber-700">
            <Package className="h-4 w-4 inline mr-1" />
            Pagamento em análise pelo banco. Você receberá um e-mail quando confirmado.
          </CardContent>
        </Card>
      )}

      {/* Itens */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Itens do pedido</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pedido.itens.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.nomeProduto} × {item.quantidade}</span>
              <span className="font-medium">{fmt(item.precoUnitario * item.quantidade)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{fmt(pedido.valorTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Entrega */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Entrega</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{ENTREGA_LABEL[pedido.opcaoEntrega] ?? pedido.opcaoEntrega}</p>
          {pedido.observacoes && (
            <p className="text-xs text-muted-foreground mt-1">Obs: {pedido.observacoes}</p>
          )}
        </CardContent>
      </Card>

      {/* Pagamento */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Pagamento</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="text-muted-foreground">Método: <span className="font-medium text-foreground">{pedido.metodoPagamento === 'CARTAO' ? `Cartão${pedido.cardInstallments && pedido.cardInstallments > 1 ? ` (${pedido.cardInstallments}x)` : ''}` : 'PIX'}</span></p>
          <p className="font-bold text-base text-primary">{fmt(pedido.valorTotal)}</p>
        </CardContent>
      </Card>

      {/* Ação de cancelamento */}
      <div className="pt-2">
        <CancelButton pedidoId={pedido.id} status={pedido.status} isPago={isPago} valorTotal={pedido.valorTotal} />
        {isPago && (
          <p className="text-xs text-muted-foreground mt-2">
            Pedidos já pagos passam por análise antes do cancelamento. O estorno será processado após aprovação.
          </p>
        )}
      </div>
    </div>
  )
}
