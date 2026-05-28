'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react'
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState, ConfirmDialog } from '@/components/shared'
import { useMetasProducao, useCriarMeta, useRemoverMeta } from '@/hooks/useCampanhas'
import { useProdutos } from '@/hooks/useCatalogo'
import type { MetaProducaoDetalheResponse } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const schema = z.object({
  produtoId: z.string().min(1, 'Selecione um produto'),
  quantidadePlanejada: z.number({ message: 'Informe a quantidade' }).int().min(1, 'Mínimo 1'),
  perdaPercentualEstimada: z.number().min(0).max(100).optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  campanhaId: string
  isAdmin?: boolean
}

export function PlanejamentoTab({ campanhaId, isAdmin = false }: Props) {
  const { data: metas = [], isLoading } = useMetasProducao(campanhaId)
  const { data: produtos = [] } = useProdutos()
  const { mutateAsync: criarMeta, isPending: criando } = useCriarMeta(campanhaId)
  const { mutateAsync: removerMeta } = useRemoverMeta(campanhaId)

  const [open, setOpen] = React.useState(false)
  const [confirmMeta, setConfirmMeta] = React.useState<MetaProducaoDetalheResponse | null>(null)
  const [removendo, setRemovendo] = React.useState(false)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { produtoId: '', quantidadePlanejada: 1, perdaPercentualEstimada: 5 },
  })

  const produtosIds = new Set(metas.map(m => m.produtoId))

  async function onSubmit(values: FormValues) {
    try {
      await criarMeta({
        produtoId: values.produtoId,
        quantidadePlanejada: values.quantidadePlanejada,
        perdaPercentualEstimada: values.perdaPercentualEstimada,
      })
      toast.success('Meta de produção adicionada.')
      reset()
      setOpen(false)
    } catch (err) {
      toast.error((err as ApiError).message ?? 'Erro ao adicionar meta.')
    }
  }

  async function handleRemover() {
    if (!confirmMeta) return
    setRemovendo(true)
    try {
      await removerMeta(confirmMeta.id)
      toast.success('Meta removida.')
      setConfirmMeta(null)
    } catch {
      toast.error('Erro ao remover meta.')
    } finally {
      setRemovendo(false)
    }
  }

  const receitaTotal = metas.reduce((s, m) => s + m.receitaEsperada, 0)
  const todasViaveis = metas.length > 0 && metas.every(m => m.viavelComEstoqueCampanha)

  if (isLoading) return <Skeleton className="h-40 w-full" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Receita esperada total:{' '}
            <span className="font-semibold text-foreground">{fmt(receitaTotal)}</span>
          </p>
          {metas.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              {todasViaveis
                ? <><CheckCircle2 className="size-3.5 text-emerald-500" /> Estoque suficiente para todos os produtos</>
                : <><AlertCircle className="size-3.5 text-amber-500" /> Estoque insuficiente para alguns produtos</>}
            </p>
          )}
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Adicionar meta
          </Button>
        )}
      </div>

      {metas.length === 0 ? (
        <EmptyState
          title="Nenhuma meta definida"
          description="Adicione produtos para planejar a produção desta campanha."
        />
      ) : (
        <div className="space-y-3">
          {metas.map(m => (
            <div key={m.id} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{m.nomeProduto}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.quantidadePlanejada} unid. · {m.perdaPercentualEstimada}% perda ·{' '}
                    Receita esperada:{' '}
                    <span className="text-foreground font-medium">{fmt(m.receitaEsperada)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.viavelComEstoqueCampanha
                    ? <Badge className="bg-emerald-100 text-emerald-700 border-transparent text-xs">Estoque OK</Badge>
                    : <Badge className="bg-amber-100 text-amber-700 border-transparent text-xs">Déficit</Badge>
                  }
                  {isAdmin && (
                    <Button
                      size="icon" variant="ghost"
                      aria-label="Remover meta"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmMeta(m)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {m.materiaisNecessarios.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase tracking-wide">Material</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-right">Necessário</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-right">Disponível</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-right">Déficit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {m.materiaisNecessarios.map(mat => (
                      <TableRow key={mat.tipoMateriaPrimaId}>
                        <TableCell className="text-xs">{mat.nomeTipo}</TableCell>
                        <TableCell className="text-xs text-right">
                          {mat.quantidadeNecessaria.toFixed(3)} {mat.unidade}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {mat.quantidadeDisponivel.toFixed(3)} {mat.unidade}
                        </TableCell>
                        <TableCell className={`text-xs text-right font-medium ${mat.deficit > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                          {mat.deficit > 0 ? `−${mat.deficit.toFixed(3)} ${mat.unidade}` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar meta de produção</DialogTitle>
            <DialogDescription>Defina o produto e a quantidade planejada para esta campanha.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Produto</Label>
              <Controller
                control={control}
                name="produtoId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.filter(p => !produtosIds.has(p.id)).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.produtoId && <p className="text-xs text-destructive">{errors.produtoId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantidade (unid.)</Label>
                <Controller
                  control={control}
                  name="quantidadePlanejada"
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={field.value}
                      onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)}
                    />
                  )}
                />
                {errors.quantidadePlanejada && <p className="text-xs text-destructive">{errors.quantidadePlanejada.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Perda estimada (%)</Label>
                <Controller
                  control={control}
                  name="perdaPercentualEstimada"
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={field.value ?? 5}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={criando}>
                {criando ? 'Salvando…' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmMeta !== null}
        onOpenChange={v => { if (!v) setConfirmMeta(null) }}
        title="Remover meta"
        description={`Remover a meta de "${confirmMeta?.nomeProduto}"?`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleRemover}
        isPending={removendo}
      />
    </div>
  )
}
