'use client'

import * as React from 'react'
import { Package, Plus, Trash2 } from 'lucide-react'
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState, ConfirmDialog, CurrencyInput } from '@/components/shared'
import {
  useItensAquisicao,
  useAdicionarItem,
  useRemoverItem,
  useDistribuirItens,
} from '@/hooks/useCampanhas'
import type { DestinatarioCampanha, StatusCampanha } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  precoUnitario: z.number().positive('Preço deve ser positivo'),
  quantidadeMeta: z.number().int().positive('Quantidade deve ser positiva'),
  unidade: z.string().min(1, 'Unidade obrigatória'),
})
type FormData = z.infer<typeof schema>

function AdicionarItemDialog({ campanhaId, open, onOpenChange }: {
  campanhaId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { mutateAsync: adicionar, isPending } = useAdicionarItem(campanhaId)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unidade: 'unid' },
  })

  React.useEffect(() => { if (!open) reset({ unidade: 'unid' }) }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await adicionar(data)
      toast.success('Item adicionado.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao adicionar item.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Adicionar Item de Aquisição</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register('nome')} placeholder="Ex: Caixa de colmeia Langstroth" disabled={isPending} />
            {errors.nome && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.nome.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="precoUnitario"
              render={({ field, fieldState }) => (
                <CurrencyInput
                  label="Preço Unitário *"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isPending}
                />
              )}
            />
            <div className="space-y-1.5">
              <Label htmlFor="quantidadeMeta">Qtd Meta *</Label>
              <Input
                id="quantidadeMeta"
                type="number"
                min="1"
                {...register('quantidadeMeta', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.quantidadeMeta && (
                <p className="text-[0.8rem] font-medium text-destructive">{errors.quantidadeMeta.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unidade">Unidade *</Label>
            <Input id="unidade" {...register('unidade')} placeholder="Ex: unid, kg, cx" disabled={isPending} />
            {errors.unidade && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.unidade.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adicionando…' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
  isAdmin: boolean
  destinatario?: DestinatarioCampanha
}

export function ItensAquisicaoTab({ campanhaId, statusCampanha, isAdmin, destinatario }: Props) {
  const { data: itens = [], isLoading } = useItensAquisicao(campanhaId)
  const { mutateAsync: remover } = useRemoverItem(campanhaId)
  const { mutateAsync: distribuir, isPending: distribuindo } = useDistribuirItens(campanhaId)

  const [adicionarOpen, setAdicionarOpen] = React.useState(false)
  const [removerItemId, setRemoverItemId] = React.useState<string | null>(null)
  const [confirmDistribuir, setConfirmDistribuir] = React.useState(false)

  const podeEditar = statusCampanha === 'PLANEJADA' || statusCampanha === 'ATIVA'
  const podeDistribuir = isAdmin && statusCampanha === 'CONCLUIDA' && destinatario === 'APA' && itens.length > 0

  async function handleRemover(itemId: string) {
    try {
      await remover(itemId)
      toast.success('Item removido.')
    } catch {
      toast.error('Erro ao remover item.')
    }
  }

  async function handleDistribuir() {
    try {
      await distribuir()
      toast.success('Campanha liquidada e apuração gerada.')
      setConfirmDistribuir(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao liquidar campanha.')
      setConfirmDistribuir(false)
    }
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-4">
      {itens.length === 0 ? (
        <EmptyState
          title="Nenhum item de aquisição"
          description="Adicione os itens que serão adquiridos com os recursos desta campanha."
          className="py-8"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Preço Unit.</TableHead>
              <TableHead className="text-right">Meta</TableHead>
              <TableHead className="text-right">Pedido</TableHead>
              <TableHead>Status</TableHead>
              {podeEditar && isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(item.precoUnitario)}</TableCell>
                <TableCell className="text-right tabular-nums">{item.quantidadeMeta} {item.unidade}</TableCell>
                <TableCell className="text-right tabular-nums">{item.quantidadeTotalPedida} {item.unidade}</TableCell>
                <TableCell>
                  {item.metaAtingida ? (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-transparent">Meta atingida</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-transparent">Em andamento</Badge>
                  )}
                </TableCell>
                {podeEditar && isAdmin && (
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Remover item"
                      onClick={() => setRemoverItemId(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {podeEditar && (
            <Button size="sm" variant="outline" onClick={() => setAdicionarOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Adicionar Item
            </Button>
          )}
          {podeDistribuir && (
            <Button size="sm" variant="outline" onClick={() => setConfirmDistribuir(true)} disabled={distribuindo}>
              <Package className="h-3.5 w-3.5" /> Liquidar Campanha APA
            </Button>
          )}
        </div>
      )}

      <AdicionarItemDialog campanhaId={campanhaId} open={adicionarOpen} onOpenChange={setAdicionarOpen} />

      <ConfirmDialog
        open={Boolean(removerItemId)}
        onOpenChange={(o) => { if (!o) setRemoverItemId(null) }}
        title="Remover item?"
        description="Este item de aquisição será removido permanentemente."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => removerItemId ? handleRemover(removerItemId) : Promise.resolve()}
      />

      <AlertDialog open={confirmDistribuir} onOpenChange={setConfirmDistribuir}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liquidar campanha APA?</AlertDialogTitle>
            <AlertDialogDescription>
              Será gerada a apuração financeira com base nas cotas pagas e a campanha será marcada como LIQUIDADA. Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={distribuindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDistribuir()}
              disabled={distribuindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {distribuindo ? 'Liquidando…' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
