'use client'

import * as React from 'react'
import { Plus, Trash2, Package } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import type { StatusCampanha } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const TIPO_DESTINO_LABELS: Record<string, string> = {
  EQUIPAMENTO: 'Equipamento',
  CONSUMIVEL: 'Consumível',
  MATERIA_PRIMA: 'Matéria-prima',
}

const schema = z.object({
  descricao: z.string().min(1, 'Descrição obrigatória'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
  valorEstimado: z.number().positive('Valor deve ser positivo'),
  tipoDestino: z.enum(['EQUIPAMENTO', 'CONSUMIVEL', 'MATERIA_PRIMA'], { message: 'Selecione o destino' }),
  equipamentoNome: z.string().optional(),
  tipoMateriaPrimaId: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function AdicionarItemDialog({ campanhaId, open, onOpenChange }: {
  campanhaId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { mutateAsync: adicionar, isPending } = useAdicionarItem(campanhaId)

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const tipoDestino = watch('tipoDestino')

  React.useEffect(() => { if (!open) reset() }, [open, reset])

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
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" {...register('descricao')} disabled={isPending} />
            {errors.descricao && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.descricao.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            </div>
            <Controller
              control={control}
              name="valorEstimado"
              render={({ field, fieldState }) => (
                <CurrencyInput
                  label="Valor Estimado *"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isPending}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Destino *</Label>
            <Controller
              control={control}
              name="tipoDestino"
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o destino…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUIPAMENTO">Equipamento</SelectItem>
                      <SelectItem value="CONSUMIVEL">Consumível</SelectItem>
                      <SelectItem value="MATERIA_PRIMA">Matéria-prima</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
          {tipoDestino === 'EQUIPAMENTO' && (
            <div className="space-y-1.5">
              <Label htmlFor="equipamentoNome">Nome do Equipamento</Label>
              <Input id="equipamentoNome" {...register('equipamentoNome')} disabled={isPending} />
            </div>
          )}
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

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
  isAdmin: boolean
}

export function ItensAquisicaoTab({ campanhaId, statusCampanha, isAdmin }: Props) {
  const { data: itens = [], isLoading } = useItensAquisicao(campanhaId)
  const { mutateAsync: remover } = useRemoverItem(campanhaId)
  const { mutateAsync: distribuir, isPending: distribuindo } = useDistribuirItens(campanhaId)

  const [adicionarOpen, setAdicionarOpen] = React.useState(false)
  const [removerItemId, setRemoverItemId] = React.useState<string | null>(null)
  const [confirmDistribuir, setConfirmDistribuir] = React.useState(false)

  const podeEditar = statusCampanha === 'PLANEJADA' || statusCampanha === 'ATIVA'
  const podeDistribuir = statusCampanha === 'CONCLUIDA' && itens.length > 0

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

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
      const result = await distribuir()
      toast.success(
        `${result.itensDistribuidos} item(s) distribuído(s). ${result.equipamentosCriados} equipamento(s) criado(s).`
      )
      setConfirmDistribuir(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao distribuir itens.')
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
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Valor Est.</TableHead>
              <TableHead>Destino</TableHead>
              {podeEditar && isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.descricao}</TableCell>
                <TableCell className="text-right tabular-nums">{item.quantidade}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(item.valorEstimado)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {TIPO_DESTINO_LABELS[item.tipoDestino] ?? item.tipoDestino}
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDistribuir(true)}
              disabled={distribuindo}
            >
              <Package className="h-3.5 w-3.5" /> Distribuir Itens
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
            <AlertDialogTitle>Distribuir itens adquiridos?</AlertDialogTitle>
            <AlertDialogDescription>
              Os itens serão registrados no patrimônio e estoque da associação conforme seu tipo de destino.
              Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={distribuindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDistribuir()}
              disabled={distribuindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {distribuindo ? 'Distribuindo…' : 'Distribuir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
