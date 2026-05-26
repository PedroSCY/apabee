'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, CheckCheck, Trash2, ArrowDownToLine, Undo2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CurrencyInput, DecimalInput, EmptyState, ConfirmDialog } from '@/components/shared'
import {
  useEstoqueCampanha,
  useOrdensProducao,
  useCriarOrdemProducao,
  useConfirmarOrdemProducao,
  useRemoverOrdemProducao,
  useEstornarOrdem,
  useCalcularConsumo,
  useAlocarPool,
} from '@/hooks/useCampanhas'
import { useProdutos } from '@/hooks/useCatalogo'
import { useEstoquePool, useTiposMateriaPrima } from '@/hooks/useProducao'
import type { OrdemProducaoResponse, StatusCampanha } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const STATUS_ORDEM: Record<OrdemProducaoResponse['status'], { label: string; className: string }> = {
  RASCUNHO: { label: 'Rascunho', className: 'bg-slate-100 text-slate-700 border-transparent' },
  CONCLUIDA: { label: 'Concluída', className: 'bg-emerald-100 text-emerald-700 border-transparent' },
}

const alocarSchema = z.object({
  tipoMateriaPrimaId: z.string().min(1, 'Selecione o tipo de matéria-prima'),
  quantidade: z.number({ message: 'Informe a quantidade' }).positive('Deve ser positiva'),
  valorMonetario: z.number({ message: 'Informe o valor' }).positive('Deve ser positivo'),
})
type AlocarFormData = z.infer<typeof alocarSchema>

const criarSchema = z.object({
  produtoId: z.string().min(1, 'Selecione o produto'),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  perdaPercentual: z.number().min(0, 'Não pode ser negativo').max(100).optional(),
})
type CriarFormData = z.infer<typeof criarSchema>

const confirmarSchema = z.object({
  quantidadeReal: z.number().int('Deve ser um número inteiro').min(1, 'Mínimo 1'),
  sobrasRecuperadas: z.number().min(0, 'Não pode ser negativo').optional(),
  observacao: z.string().optional(),
})
type ConfirmarFormData = z.infer<typeof confirmarSchema>

function AlocarPoolDialog({ campanhaId, open, onOpenChange }: {
  campanhaId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { data: pool = [] } = useEstoquePool()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutateAsync: alocar, isPending } = useAlocarPool(campanhaId)
  const tipoNomePool = (id: string) => tipos.find(t => t.id === id)?.nome ?? id.slice(0, 8)

  const { handleSubmit, reset, control, watch, formState: { errors } } = useForm<AlocarFormData>({
    resolver: zodResolver(alocarSchema),
  })

  const tipoSelecionadoId = watch('tipoMateriaPrimaId')
  const poolSelecionado = pool.find(p => p.tipoMateriaPrimaId === tipoSelecionadoId)

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: AlocarFormData) {
    try {
      await alocar(data)
      toast.success('Matéria-prima alocada para a campanha.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao alocar do pool.')
    }
  }

  const poolComSaldo = pool.filter(p => p.quantidadeDisponivel > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alocar Matéria-Prima do Pool</DialogTitle>
        </DialogHeader>
        {poolComSaldo.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma matéria-prima disponível no pool.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo de matéria-prima *</Label>
              <Controller
                control={control}
                name="tipoMateriaPrimaId"
                render={({ field, fieldState }) => (
                  <>
                    <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                      <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione o tipo…" />
                      </SelectTrigger>
                      <SelectContent>
                        {poolComSaldo.map(p => (
                          <SelectItem key={p.tipoMateriaPrimaId} value={p.tipoMateriaPrimaId}>
                            {tipoNomePool(p.tipoMateriaPrimaId)}
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
              {poolSelecionado && (
                <p className="text-xs text-muted-foreground">
                  Disponível no pool: {poolSelecionado.quantidadeDisponivel.toLocaleString('pt-BR')} {poolSelecionado.unidade}
                </p>
              )}
            </div>
            <Controller
              control={control}
              name="quantidade"
              render={({ field, fieldState }) => (
                <DecimalInput
                  id="quantidade-pool"
                  label="Quantidade a alocar *"
                  decimals={3}
                  min={0.001}
                  max={poolSelecionado?.quantidadeDisponivel}
                  unit={poolSelecionado?.unidade}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isPending || !tipoSelecionadoId}
                />
              )}
            />
            <Controller
              control={control}
              name="valorMonetario"
              render={({ field, fieldState }) => (
                <CurrencyInput
                  label="Valor monetário (R$) *"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending || !tipoSelecionadoId}
                  error={fieldState.error?.message}
                />
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Alocando…' : 'Alocar'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CriarOrdemDialog({ campanhaId, open, onOpenChange }: {
  campanhaId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { data: produtos = [] } = useProdutos()
  const { mutateAsync: criar, isPending } = useCriarOrdemProducao(campanhaId)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CriarFormData>({
    resolver: zodResolver(criarSchema),
    defaultValues: { perdaPercentual: 10 },
  })

  React.useEffect(() => { if (!open) reset({ perdaPercentual: 10 }) }, [open, reset])

  async function onSubmit(data: CriarFormData) {
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

function ConfirmarOrdemDialog({ campanhaId, ordem, open, onOpenChange }: {
  campanhaId: string
  ordem: OrdemProducaoResponse | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { mutateAsync: confirmar, isPending: confirmando } = useConfirmarOrdemProducao(campanhaId)
  const { mutateAsync: calcular, data: consumoData, isPending: calculando, reset: resetConsumo } = useCalcularConsumo(campanhaId)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ConfirmarFormData>({
    resolver: zodResolver(confirmarSchema),
    defaultValues: { quantidadeReal: ordem?.quantidade ?? 1 },
  })

  React.useEffect(() => {
    if (open && ordem) {
      reset({ quantidadeReal: ordem.quantidade })
      void calcular(ordem.id)
    } else {
      reset()
      resetConsumo()
    }
  }, [open, ordem?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: ConfirmarFormData) {
    if (!ordem) return
    try {
      await confirmar({ ordemId: ordem.id, ...data })
      toast.success('Ordem confirmada. Estoque atualizado.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao confirmar ordem.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Confirmar Ordem de Produção</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {calculando && <Skeleton className="h-24 w-full" />}
          {consumoData && consumoData.materiais.length > 0 && (
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Consumo estimado</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-xs">Material</TableHead>
                    <TableHead className="h-8 text-xs text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumoData.materiais.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-1.5 text-sm">{m.nome}</TableCell>
                      <TableCell className="py-1.5 text-sm text-right tabular-nums">
                        {m.quantidade.toLocaleString('pt-BR')} {m.unidade}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantidadeReal">Quantidade real produzida *</Label>
              <Input
                id="quantidadeReal"
                type="number"
                min="1"
                {...register('quantidadeReal', { valueAsNumber: true })}
                disabled={confirmando}
              />
              {errors.quantidadeReal && (
                <p className="text-[0.8rem] font-medium text-destructive">{errors.quantidadeReal.message}</p>
              )}
            </div>
            <Controller
              control={control}
              name="sobrasRecuperadas"
              render={({ field, fieldState }) => (
                <DecimalInput
                  id="sobrasRecuperadas"
                  label="Sobras recuperadas (kg/L)"
                  decimals={3}
                  min={0}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={confirmando}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Textarea
              id="observacao"
              rows={2}
              placeholder="Ex: lote com coloração mais escura…"
              {...register('observacao')}
              disabled={confirmando}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={confirmando} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={confirmando || calculando}>
              {confirmando ? 'Confirmando…' : 'Confirmar Ordem'}
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
  onConcluir?: () => void
}

export function OrdensProducaoTab({ campanhaId, statusCampanha, onConcluir }: Props) {
  const { data: ordens = [], isLoading } = useOrdensProducao(campanhaId)
  const { data: estoque = [] } = useEstoqueCampanha(campanhaId)
  const { data: produtos = [] } = useProdutos()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutateAsync: remover } = useRemoverOrdemProducao(campanhaId)
  const { mutateAsync: estornar } = useEstornarOrdem(campanhaId)

  const [criarOpen, setCriarOpen] = React.useState(false)
  const [alocarOpen, setAlocarOpen] = React.useState(false)
  const [confirmarOrdem, setConfirmarOrdem] = React.useState<OrdemProducaoResponse | null>(null)
  const [removerOrdemId, setRemoverOrdemId] = React.useState<string | null>(null)
  const [estornarOrdemId, setEstornarOrdemId] = React.useState<string | null>(null)

  const podeEditar = statusCampanha === 'ATIVA'
  const produtoNome = (id: string) => produtos.find(p => p.id === id)?.nome ?? id.slice(0, 8)
  const tipoNome = (id: string) => tipos.find(t => t.id === id)?.nome ?? id.slice(0, 8)
  const todasConcluidas = ordens.length > 0 && ordens.every(o => o.status === 'CONCLUIDA')

  async function handleRemover(ordemId: string) {
    try {
      await remover(ordemId)
      toast.success('Ordem removida.')
    } catch {
      toast.error('Erro ao remover ordem.')
    }
  }

  async function handleEstornar(ordemId: string) {
    try {
      await estornar(ordemId)
      toast.success('Ordem estornada. Estoque restaurado.')
    } catch (e) {
      toast.error((e as { message?: string }).message ?? 'Erro ao estornar ordem.')
    }
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-6">
      {estoque.length > 0 && (
        <div className="rounded-md border p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Matéria-Prima Disponível</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Disponível</TableHead>
                <TableHead>Unidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estoque.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{tipoNome(e.tipoMateriaPrimaId)}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {e.quantidadeDisponivel.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.unidade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="space-y-4">
        {ordens.length === 0 ? (
          <EmptyState title="Nenhuma ordem de produção" description="Crie uma ordem para processar matéria-prima em produtos." className="py-8" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd planejada</TableHead>
                <TableHead className="text-right">Qtd real</TableHead>
                <TableHead className="text-right">Perda %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                {podeEditar && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordens.map(o => (
                <TableRow
                  key={o.id}
                  className={o.status === 'CONCLUIDA' ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : undefined}
                >
                  <TableCell className="font-medium">{produtoNome(o.produtoId)}</TableCell>
                  <TableCell className="text-right tabular-nums">{o.quantidade}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {o.quantidadeReal ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{o.perdaPercentual}%</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_ORDEM[o.status].className}>
                      {STATUS_ORDEM[o.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {o.confirmadoEm
                      ? format(parseISO(o.confirmadoEm), 'dd/MM/yyyy', { locale: ptBR })
                      : format(parseISO(o.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  {podeEditar && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {o.status === 'RASCUNHO' && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-emerald-600 hover:text-emerald-600"
                              title="Confirmar ordem"
                              onClick={() => setConfirmarOrdem(o)}
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
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
                        {o.status === 'CONCLUIDA' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-amber-600 hover:text-amber-600"
                            title="Estornar ordem"
                            onClick={() => setEstornarOrdemId(o.id)}
                          >
                            <Undo2 className="h-3.5 w-3.5" />
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

        {podeEditar && todasConcluidas && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCheck className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Todas as ordens confirmadas. Campanha pronta para ser concluída.</span>
            </div>
            {onConcluir && (
              <Button size="sm" onClick={onConcluir} className="shrink-0">
                Concluir Campanha
              </Button>
            )}
          </div>
        )}

        {podeEditar && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setAlocarOpen(true)}>
              <ArrowDownToLine className="h-3.5 w-3.5" /> Alocar do Pool
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCriarOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Nova Ordem
            </Button>
          </div>
        )}

        <AlocarPoolDialog campanhaId={campanhaId} open={alocarOpen} onOpenChange={setAlocarOpen} />
        <CriarOrdemDialog campanhaId={campanhaId} open={criarOpen} onOpenChange={setCriarOpen} />

        <ConfirmarOrdemDialog
          campanhaId={campanhaId}
          ordem={confirmarOrdem}
          open={Boolean(confirmarOrdem)}
          onOpenChange={(o) => { if (!o) setConfirmarOrdem(null) }}
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

        <ConfirmDialog
          open={Boolean(estornarOrdemId)}
          onOpenChange={(o) => { if (!o) setEstornarOrdemId(null) }}
          title="Estornar ordem?"
          description="A ordem voltará para Rascunho e o estoque da campanha será restaurado. A produção e as sobras serão revertidas."
          confirmLabel="Estornar"
          variant="destructive"
          onConfirm={() => estornarOrdemId ? handleEstornar(estornarOrdemId) : Promise.resolve()}
        />
      </div>
    </div>
  )
}
