'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Play, Calculator, Trash2 } from 'lucide-react'
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
import { DecimalInput, EmptyState, ConfirmDialog } from '@/components/shared'
import {
  useOrdensProducao,
  useCriarOrdemProducao,
  useExecutarOrdemProducao,
  useRemoverOrdemProducao,
  useCalcularConsumo,
} from '@/hooks/useCampanhas'
import { useProdutos } from '@/hooks/useCatalogo'
import type { OrdemProducaoResponse, StatusCampanha } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const STATUS_ORDEM: Record<OrdemProducaoResponse['status'], { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-slate-100 text-slate-700 border-transparent' },
  EM_EXECUCAO: { label: 'Em Execução', className: 'bg-amber-100 text-amber-700 border-transparent' },
  CONCLUIDA: { label: 'Concluída', className: 'bg-emerald-100 text-emerald-700 border-transparent' },
}

const schema = z.object({
  produtoId: z.string().min(1, 'Selecione o produto'),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  perdaPercentual: z.number().min(0, 'Não pode ser negativo').max(100).optional(),
})
type FormData = z.infer<typeof schema>

function CriarOrdemDialog({ campanhaId, open, onOpenChange }: {
  campanhaId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { data: produtos = [] } = useProdutos()
  const { mutateAsync: criar, isPending } = useCriarOrdemProducao(campanhaId)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { perdaPercentual: 10 },
  })

  React.useEffect(() => { if (!open) reset({ perdaPercentual: 10 }) }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await criar(data)
      toast.success('Ordem de produção criada.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao criar ordem.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nova Ordem de Produção</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Produto *</Label>
            <Controller
              control={control}
              name="produtoId"
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o produto…" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
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
              name="perdaPercentual"
              render={({ field, fieldState }) => (
                <DecimalInput
                  id="perdaPercentual"
                  label="Perda % (opcional)"
                  decimals={1}
                  min={0}
                  max={100}
                  unit="%"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isPending}
                />
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando…' : 'Criar Ordem'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ConsumoDialog({ campanhaId, ordemId, open, onOpenChange }: {
  campanhaId: string
  ordemId: string | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { mutateAsync: calcular, data, isPending, reset } = useCalcularConsumo(campanhaId)

  React.useEffect(() => {
    if (open && ordemId) {
      void calcular(ordemId)
    } else {
      reset()
    }
  }, [open, ordemId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Consumo Estimado</DialogTitle></DialogHeader>
        {isPending && <Skeleton className="h-24 w-full" />}
        {data && (
          <div className="space-y-2">
            {data.materiais.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum material necessário.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.materiais.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{m.nome}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {m.quantidade.toLocaleString('pt-BR')} {m.unidade}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
}

export function OrdensProducaoTab({ campanhaId, statusCampanha }: Props) {
  const { data: ordens = [], isLoading } = useOrdensProducao(campanhaId)
  const { data: produtos = [] } = useProdutos()
  const { mutateAsync: executar, isPending: executando } = useExecutarOrdemProducao(campanhaId)
  const { mutateAsync: remover } = useRemoverOrdemProducao(campanhaId)

  const [criarOpen, setCriarOpen] = React.useState(false)
  const [consumoOrdemId, setConsumoOrdemId] = React.useState<string | null>(null)
  const [removerOrdemId, setRemoverOrdemId] = React.useState<string | null>(null)

  const podeEditar = statusCampanha === 'PLANEJADA' || statusCampanha === 'ATIVA'
  const produtoNome = (id: string) => produtos.find(p => p.id === id)?.nome ?? id.slice(0, 8)

  async function handleExecutar(ordemId: string) {
    try {
      await executar(ordemId)
      toast.success('Ordem executada. Estoque atualizado.')
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao executar ordem.')
    }
  }

  async function handleRemover(ordemId: string) {
    try {
      await remover(ordemId)
      toast.success('Ordem removida.')
    } catch {
      toast.error('Erro ao remover ordem.')
    }
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-4">
      {ordens.length === 0 ? (
        <EmptyState title="Nenhuma ordem de produção" description="Crie uma ordem para processar matéria-prima em produtos." className="py-8" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Perda %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              {podeEditar && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordens.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{produtoNome(o.produtoId)}</TableCell>
                <TableCell className="text-right tabular-nums">{o.quantidade}</TableCell>
                <TableCell className="text-right tabular-nums">{o.perdaPercentual}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_ORDEM[o.status].className}>
                    {STATUS_ORDEM[o.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(parseISO(o.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                {podeEditar && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Calcular consumo"
                        onClick={() => setConsumoOrdemId(o.id)}
                      >
                        <Calculator className="h-3.5 w-3.5" />
                      </Button>
                      {o.status === 'PENDENTE' && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-600"
                            title="Executar ordem"
                            onClick={() => void handleExecutar(o.id)}
                            disabled={executando}
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Remover ordem"
                            onClick={() => setRemoverOrdemId(o.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {podeEditar && (
        <Button size="sm" variant="outline" onClick={() => setCriarOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Nova Ordem
        </Button>
      )}

      <CriarOrdemDialog campanhaId={campanhaId} open={criarOpen} onOpenChange={setCriarOpen} />

      <ConsumoDialog
        campanhaId={campanhaId}
        ordemId={consumoOrdemId}
        open={Boolean(consumoOrdemId)}
        onOpenChange={(o) => { if (!o) setConsumoOrdemId(null) }}
      />

      <ConfirmDialog
        open={Boolean(removerOrdemId)}
        onOpenChange={(o) => { if (!o) setRemoverOrdemId(null) }}
        title="Remover ordem?"
        description="Esta ordem de produção será removida permanentemente."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => removerOrdemId ? handleRemover(removerOrdemId) : Promise.resolve()}
      />
    </div>
  )
}
