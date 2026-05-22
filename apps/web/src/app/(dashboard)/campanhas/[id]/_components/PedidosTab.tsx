'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Check, Package } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared'
import {
  usePedidosAquisicao,
  useRegistrarPedido,
  useConfirmarPagamentoPedido,
  useMarcarPedidoEntregue,
  useItensAquisicao,
} from '@/hooks/useCampanhas'
import { useAssociados } from '@/hooks/useAssociados'
import type { StatusCampanha, DestinatarioCampanha } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso: string) => format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })

const schema = z.object({
  itemAquisicaoId: z.string().min(1, 'Selecione o item'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
  associadoId: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function RegistrarPedidoDialog({ campanhaId, destinatario, open, onOpenChange }: {
  campanhaId: string
  destinatario?: DestinatarioCampanha
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { data: itens = [] } = useItensAquisicao(campanhaId)
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: registrar, isPending } = useRegistrarPedido(campanhaId)

  const isIndividual = destinatario === 'INDIVIDUAL'

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const itemId = watch('itemAquisicaoId')
  const selectedItem = itens.find(i => i.id === itemId)

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await registrar({
        itemAquisicaoId: data.itemAquisicaoId,
        quantidade: data.quantidade,
        associadoId: data.associadoId || undefined,
        origem: data.associadoId ? 'ASSOCIADO' : 'RECURSO_PROPRIO',
      })
      toast.success('Pedido registrado.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao registrar pedido.')
    }
  }

  const valorEstimado = selectedItem && watch('quantidade')
    ? selectedItem.precoUnitario * (watch('quantidade') ?? 0)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registrar Pedido</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Item *</Label>
            <Controller
              control={control}
              name="itemAquisicaoId"
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o item…" />
                    </SelectTrigger>
                    <SelectContent>
                      {itens.map(i => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.nome} — {fmt(i.precoUnitario)}/{i.unidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              {...register('quantidade', { valueAsNumber: true })}
              disabled={isPending}
            />
            {errors.quantidade && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.quantidade.message}</p>
            )}
            {valorEstimado > 0 && (
              <p className="text-xs text-muted-foreground">Valor total estimado: <span className="font-medium text-foreground">{fmt(valorEstimado)}</span></p>
            )}
          </div>

          {isIndividual && (
            <div className="space-y-1.5">
              <Label>Associado</Label>
              <Controller
                control={control}
                name="associadoId"
                render={({ field }) => (
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o associado (ou deixe vazio para APA)…" />
                    </SelectTrigger>
                    <SelectContent>
                      {associados.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">Sem associado = pedido da APA (Recurso Próprio)</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Registrando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
  isAdmin: boolean
  destinatario?: DestinatarioCampanha
}

export function PedidosTab({ campanhaId, statusCampanha, isAdmin, destinatario }: Props) {
  const { data: pedidos = [], isLoading: loadingPedidos } = usePedidosAquisicao(campanhaId)
  const { data: itens = [], isLoading: loadingItens } = useItensAquisicao(campanhaId)
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: confirmarPagamento, isPending: confirmandoPagamento } = useConfirmarPagamentoPedido(campanhaId)
  const { mutateAsync: marcarEntregue, isPending: marcandoEntregue } = useMarcarPedidoEntregue(campanhaId)

  const [registrarOpen, setRegistrarOpen] = React.useState(false)

  const podeRegistrar = statusCampanha === 'ATIVA' && isAdmin

  const associadoNome = (id?: string) =>
    id ? (associados.find(a => a.id === id)?.usuario.nome ?? id.slice(0, 8)) : 'APA (Recurso Próprio)'

  const itemNome = (id: string) =>
    itens.find(i => i.id === id)?.nome ?? id.slice(0, 8)

  async function handleConfirmarPagamento(pedidoId: string) {
    try {
      await confirmarPagamento(pedidoId)
      toast.success('Pagamento confirmado.')
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao confirmar pagamento.')
    }
  }

  async function handleMarcarEntregue(pedidoId: string) {
    try {
      await marcarEntregue(pedidoId)
      toast.success('Pedido marcado como entregue.')
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao marcar como entregue.')
    }
  }

  if (loadingPedidos || loadingItens) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-4">
      {itens.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {itens.map(item => {
            const pct = item.quantidadeMeta > 0
              ? Math.min((item.quantidadeTotalPedida / item.quantidadeMeta) * 100, 100)
              : 0
            return (
              <div key={item.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{item.nome}</p>
                  {item.metaAtingida && (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-transparent shrink-0 text-xs">
                      Meta atingida
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.quantidadeTotalPedida} / {item.quantidadeMeta} {item.unidade}</span>
                  <span>{fmt(item.precoUnitario)}/{item.unidade}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${item.metaAtingida ? 'bg-emerald-500' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{pct.toFixed(0)}%</p>
              </div>
            )
          })}
        </div>
      )}

      {pedidos.length === 0 ? (
        <EmptyState
          title="Nenhum pedido registrado"
          description="Registre os pedidos dos associados para os itens desta campanha."
          className="py-8"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Associado / Origem</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Entrega</TableHead>
              {isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{associadoNome(p.associadoId)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{itemNome(p.itemAquisicaoId)}</TableCell>
                <TableCell className="text-right tabular-nums">{p.quantidade}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(p.valorTotal)}</TableCell>
                <TableCell>
                  {p.pago ? (
                    <div>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-transparent">Pago</Badge>
                      {p.pagoEm && <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(p.pagoEm)}</p>}
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-transparent">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {p.entregue ? (
                    <div>
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-transparent">Entregue</Badge>
                      {p.entregueEm && <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(p.entregueEm)}</p>}
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-transparent">Aguardando</Badge>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!p.pago && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-600"
                          title="Confirmar pagamento"
                          onClick={() => void handleConfirmarPagamento(p.id)}
                          disabled={confirmandoPagamento}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {p.pago && !p.entregue && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-indigo-600 hover:text-indigo-600"
                          title="Marcar como entregue"
                          onClick={() => void handleMarcarEntregue(p.id)}
                          disabled={marcandoEntregue}
                        >
                          <Package className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {podeRegistrar && (
        <Button size="sm" variant="outline" onClick={() => setRegistrarOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Registrar Pedido
        </Button>
      )}

      <RegistrarPedidoDialog
        campanhaId={campanhaId}
        destinatario={destinatario}
        open={registrarOpen}
        onOpenChange={setRegistrarOpen}
      />
    </div>
  )
}
