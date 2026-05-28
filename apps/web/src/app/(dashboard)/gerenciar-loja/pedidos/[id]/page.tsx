'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Home,
  MapPin,
  MessageSquare,
  Package,
  Truck,
  User,
  XCircle,
} from 'lucide-react'
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
import {
  useAdminPedidoLoja,
  useAdminClientes,
  useAtualizarStatusPedidoLoja,
  useAprovarCancelamentoPedidoLoja,
  useRejeitarCancelamentoPedidoLoja,
} from '@/hooks/useLoja'

// ─── Formatadores ─────────────────────────────────────────────────────────────

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso: string) => new Date(iso).toLocaleString('pt-BR')

// ─── Configurações visuais ────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; cls: string; bgBanner: string; textBanner: string }> = {
  AGUARDANDO_PAGAMENTO: {
    label: 'Aguardando pagamento',
    cls: 'bg-amber-100 text-amber-700 border-amber-300',
    bgBanner: 'bg-amber-50 border-amber-200',
    textBanner: 'text-amber-800',
  },
  PAGO: {
    label: 'Pago — aguardando preparação',
    cls: 'bg-blue-100 text-blue-700 border-blue-300',
    bgBanner: 'bg-blue-50 border-blue-200',
    textBanner: 'text-blue-800',
  },
  EM_PREPARACAO: {
    label: 'Em preparação',
    cls: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    bgBanner: 'bg-indigo-50 border-indigo-200',
    textBanner: 'text-indigo-800',
  },
  SAIU_ENTREGA: {
    label: 'Saiu para entrega',
    cls: 'bg-purple-100 text-purple-700 border-purple-300',
    bgBanner: 'bg-purple-50 border-purple-200',
    textBanner: 'text-purple-800',
  },
  ENTREGUE: {
    label: 'Entregue ✓',
    cls: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    bgBanner: 'bg-emerald-50 border-emerald-200',
    textBanner: 'text-emerald-800',
  },
  CANCELADO: {
    label: 'Cancelado',
    cls: 'bg-red-100 text-red-700 border-red-300',
    bgBanner: 'bg-red-50 border-red-200',
    textBanner: 'text-red-800',
  },
  CANCELAMENTO_SOLICITADO: {
    label: '⚠ Cancelamento solicitado',
    cls: 'bg-orange-100 text-orange-700 border-orange-300',
    bgBanner: 'bg-orange-50 border-orange-200',
    textBanner: 'text-orange-800',
  },
}

const ENTREGA_LABEL: Record<string, string> = {
  PRATA_GRATIS: 'Entrega em Prata - PB (Grátis)',
  RETIRADA_LOCAL: 'Retirada na sede da APA',
  A_COMBINAR: 'Outra cidade — A combinar',
  CORREIOS: 'Correios',
}

const ENTREGA_ICON: Record<string, React.ReactNode> = {
  PRATA_GRATIS: <Truck className="h-4 w-4" />,
  RETIRADA_LOCAL: <Home className="h-4 w-4" />,
  A_COMBINAR: <MessageSquare className="h-4 w-4" />,
  CORREIOS: <Package className="h-4 w-4" />,
}

// ─── Banner de ações ───────────────────────────────────────────────────────────

interface ActionBannerProps {
  pedidoId: string
  status: string
  isPending: boolean
  onAction: (status: string) => void
  onAprovarCancelamento: () => void
  onRejeitarCancelamento: () => void
  isAprovarPending: boolean
  isRejeitarPending: boolean
}

function ActionBanner({
  pedidoId: _pedidoId,
  status,
  isPending,
  onAction,
  onAprovarCancelamento,
  onRejeitarCancelamento,
  isAprovarPending,
  isRejeitarPending,
}: ActionBannerProps) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG['AGUARDANDO_PAGAMENTO']

  // ── Solicitação de cancelamento do cliente ──
  if (status === 'CANCELAMENTO_SOLICITADO') {
    return (
      <div className={`rounded-lg border p-4 ${cfg.bgBanner}`}>
        <p className={`text-sm font-semibold mb-3 ${cfg.textBanner}`}>
          ⚠ O cliente solicitou o cancelamento deste pedido pago.
          Aprovar irá processar o estorno do valor pago.
        </p>
        <div className="flex gap-2 flex-wrap">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={isAprovarPending || isRejeitarPending} className="bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="h-4 w-4 mr-1.5" />
                Aprovar cancelamento + estorno
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Aprovar cancelamento e estorno?</AlertDialogTitle>
                <AlertDialogDescription>
                  O pedido será cancelado e o estorno será processado via Mercado Pago.
                  O prazo de devolução depende do método de pagamento (PIX: imediato · Cartão: 10-20 dias úteis).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onAprovarCancelamento}>
                  Sim, aprovar e estornar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={isAprovarPending || isRejeitarPending}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Rejeitar solicitação
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rejeitar solicitação de cancelamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  O pedido voltará ao status PAGO e o cliente será notificado por e-mail.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={onRejeitarCancelamento}>
                  Sim, rejeitar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  }

  // Botão de avanço de status (sem confirmação)
  const avancoBtn = (() => {
    if (status === 'PAGO') {
      return (
        <Button size="sm" disabled={isPending} onClick={() => onAction('EM_PREPARACAO')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          Iniciar preparação
        </Button>
      )
    }
    if (status === 'EM_PREPARACAO') {
      return (
        <Button size="sm" disabled={isPending} onClick={() => onAction('SAIU_ENTREGA')}
          className="bg-purple-600 hover:bg-purple-700 text-white">
          <Truck className="h-4 w-4 mr-1.5" />
          Saiu para entrega
        </Button>
      )
    }
    if (status === 'SAIU_ENTREGA') {
      return (
        <Button size="sm" disabled={isPending} onClick={() => onAction('ENTREGUE')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          Confirmar entrega
        </Button>
      )
    }
    return null
  })()

  // Botão de cancelamento pelo admin (com confirmação)
  const cancelaveis = ['PAGO', 'EM_PREPARACAO']
  const cancelBtn = cancelaveis.includes(status) ? (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={isPending} className="border-red-300 text-red-600 hover:bg-red-50">
          <XCircle className="h-4 w-4 mr-1.5" />
          Cancelar pedido
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar pedido?</AlertDialogTitle>
          <AlertDialogDescription>
            O pedido será marcado como cancelado e o cliente receberá uma notificação.
            Para processar estorno, use "Aprovar cancelamento" quando o cliente solicitar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onAction('CANCELADO')}>
            Sim, cancelar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null

  if (!avancoBtn && !cancelBtn) return null

  return (
    <div className={`rounded-lg border p-4 ${cfg.bgBanner}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className={`text-sm font-semibold ${cfg.textBanner}`}>{cfg.label}</p>
        <div className="flex gap-2 flex-wrap">
          {avancoBtn}
          {cancelBtn}
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminPedidoPage() {
  const { id } = useParams<{ id: string }>()
  const { data: pedido, isLoading } = useAdminPedidoLoja(id)
  const atualizarStatus = useAtualizarStatusPedidoLoja()
  const aprovarCancelamento = useAprovarCancelamentoPedidoLoja()
  const rejeitarCancelamento = useRejeitarCancelamentoPedidoLoja()
  const { data: clientes } = useAdminClientes()
  const [copied, setCopied] = useState(false)

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>
  if (!pedido) return <div className="p-6 text-center text-muted-foreground">Pedido não encontrado.</div>

  const cliente = clientes?.find((c) => c.id === pedido.clienteId)
  const statusCfg = STATUS_CFG[pedido.status] ?? { label: pedido.status, cls: '', bgBanner: '', textBanner: '' }

  async function handleAction(novoStatus: string) {
    try {
      await atualizarStatus.mutateAsync({ id, status: novoStatus })
      toast.success('Status atualizado.')
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao atualizar status.')
    }
  }

  async function handleAprovarCancelamento() {
    try {
      await aprovarCancelamento.mutateAsync(id)
      toast.success('Cancelamento aprovado. Estorno processado pelo Mercado Pago.')
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao aprovar cancelamento.')
    }
  }

  async function handleRejeitarCancelamento() {
    try {
      await rejeitarCancelamento.mutateAsync({ id })
      toast.success('Solicitação de cancelamento rejeitada. Pedido voltou para PAGO.')
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao rejeitar cancelamento.')
    }
  }

  function copyAddress() {
    if (!pedido) return
    const snap = pedido.enderecoEntrega
    if (!snap) return
    const text = [
      `${snap.logradouro}, ${snap.numero}${snap.complemento ? `, ${snap.complemento}` : ''}`,
      `${snap.bairro} · ${snap.cidade}/${snap.estado}`,
      `CEP: ${snap.cep}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const mapsUrl = pedido.enderecoEntrega
    ? `https://maps.google.com/?q=${encodeURIComponent(
        `${pedido.enderecoEntrega.logradouro}, ${pedido.enderecoEntrega.numero}, ${pedido.enderecoEntrega.bairro}, ${pedido.enderecoEntrega.cidade} - ${pedido.enderecoEntrega.estado}`,
      )}`
    : undefined

  return (
    <div className="p-6 max-w-2xl space-y-5">
      {/* Voltar */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/gerenciar-loja">
          <ArrowLeft className="h-4 w-4 mr-1" /> Gerenciar Loja
        </Link>
      </Button>

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-serif text-accent">Pedido #{pedido.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{fmtDate(pedido.criadoEm)}</p>
        </div>
        <Badge variant="outline" className={`text-xs px-2 py-1 ${statusCfg.cls}`}>{statusCfg.label}</Badge>
      </div>

      {/* Banner de ações — PRIMEIRO, para fluxo operacional */}
      <ActionBanner
        pedidoId={id}
        status={pedido.status}
        isPending={atualizarStatus.isPending}
        onAction={handleAction}
        onAprovarCancelamento={handleAprovarCancelamento}
        onRejeitarCancelamento={handleRejeitarCancelamento}
        isAprovarPending={aprovarCancelamento.isPending}
        isRejeitarPending={rejeitarCancelamento.isPending}
      />

      {/* Cliente + Entrega — layout de duas colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cliente */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-0.5">
            {cliente ? (
              <>
                <p className="font-medium">{cliente.nome}</p>
                <p className="text-muted-foreground break-all">{cliente.email}</p>
                {cliente.telefone && <p className="text-muted-foreground">{cliente.telefone}</p>}
              </>
            ) : (
              <p className="text-muted-foreground italic">Dados do cliente não disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Entrega */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {ENTREGA_ICON[pedido.opcaoEntrega] ?? <Package className="h-4 w-4" />}
              Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{ENTREGA_LABEL[pedido.opcaoEntrega] ?? pedido.opcaoEntrega}</p>

            {/* Endereço completo com ações */}
            {pedido.enderecoEntrega && pedido.opcaoEntrega !== 'RETIRADA_LOCAL' ? (
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  {pedido.enderecoEntrega.logradouro}, {pedido.enderecoEntrega.numero}
                  {pedido.enderecoEntrega.complemento && `, ${pedido.enderecoEntrega.complemento}`}
                </p>
                <p className="text-muted-foreground">
                  {pedido.enderecoEntrega.bairro} · {pedido.enderecoEntrega.cidade}/{pedido.enderecoEntrega.estado}
                </p>
                <p className="text-muted-foreground">CEP: {pedido.enderecoEntrega.cep}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={copyAddress}>
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                  {mapsUrl && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        <MapPin className="h-3 w-3" />
                        Ver no Mapa
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : pedido.opcaoEntrega === 'A_COMBINAR' ? (
              <p className="text-amber-600 text-xs font-medium">⚠ Contatar o cliente para combinar frete</p>
            ) : null}

            {pedido.observacoes && (
              <p className="text-muted-foreground text-xs pt-1">Obs: {pedido.observacoes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Itens */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Itens do pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pedido.itens.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.nomeProduto}</span>
                <span className="text-muted-foreground"> × {item.quantidade}</span>
                {item.campanhaCodigo && (
                  <span className="ml-2 text-[10px] text-muted-foreground">({item.campanhaCodigo})</span>
                )}
              </div>
              <span>{fmt(item.precoUnitario * item.quantidade)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{fmt(pedido.valorTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pagamento */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>
            Método:{' '}
            <span className="font-medium">
              {pedido.metodoPagamento === 'CARTAO'
                ? `Cartão${pedido.cardInstallments && pedido.cardInstallments > 1 ? ` (${pedido.cardInstallments}x)` : ''}`
                : 'PIX'}
            </span>
          </p>
          <p className="font-bold text-base text-primary">{fmt(pedido.valorTotal)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
