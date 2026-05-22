'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Trash2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencyInput, DecimalInput, EmptyState } from '@/components/shared'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryClient } from '@tanstack/react-query'
import { CAMPANHAS_KEY, useContribuicoes, useRegistrarContribuicao, useRemoverContribuicao } from '@/hooks/useCampanhas'
import { useAssociados } from '@/hooks/useAssociados'
import { useCriarColheita, useTiposMateriaPrima } from '@/hooks/useProducao'
import type { StatusCampanha, TipoCampanha } from '@/lib/api/campanhas'

const schemaProducao = z.object({
  associadoId: z.string().min(1, 'Selecione um associado'),
  tipoMateriaPrimaId: z.string().min(1, 'Selecione o tipo de matéria-prima'),
  volume: z.number().positive('Volume deve ser positivo'),
  dataColheita: z.string().optional(),
  descricao: z.string().optional(),
})

const schemaAquisicao = z.object({
  associadoId: z.string().min(1, 'Selecione um associado'),
  valorMonetario: z.number().positive('Valor deve ser positivo'),
  descricao: z.string().optional(),
})

type FormProducao = z.infer<typeof schemaProducao>
type FormAquisicao = z.infer<typeof schemaAquisicao>

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
  tipoCampanha: TipoCampanha
}

export function ContribuicoesTab({ campanhaId, statusCampanha, tipoCampanha }: Props) {
  const [formAberto, setFormAberto] = React.useState(false)
  const { data: contribuicoes = [], isLoading } = useContribuicoes(campanhaId)
  const { data: associados = [] } = useAssociados()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutateAsync: registrar, isPending: registrando } = useRegistrarContribuicao(campanhaId)
  const { mutateAsync: criarColheita, isPending: registrandoColheita } = useCriarColheita()
  const { mutateAsync: remover } = useRemoverContribuicao(campanhaId)

  const isPending = registrando || registrandoColheita
  const podeEditar = statusCampanha === 'ATIVA'
  const isProducao = tipoCampanha === 'PRODUCAO'

  const nomeAssociado = (id: string) => associados.find(a => a.id === id)?.usuario.nome ?? id.slice(0, 8)
  const nomeTipo = (id?: string) => id ? (tipos.find(t => t.id === id)?.nome ?? id.slice(0, 8)) : '—'

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-4">
      {contribuicoes.length === 0
        ? <EmptyState title="Nenhuma contribuição registrada" className="py-8" />
        : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Associado</TableHead>
                {isProducao
                  ? <><TableHead>Matéria-Prima</TableHead><TableHead className="text-right">Volume</TableHead></>
                  : <TableHead className="text-right">Valor</TableHead>
                }
                <TableHead>Data</TableHead>
                {podeEditar && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contribuicoes.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{nomeAssociado(c.associadoId)}</TableCell>
                  {isProducao
                    ? (
                      <>
                        <TableCell className="text-muted-foreground text-sm">{nomeTipo(c.tipoMateriaPrimaId)}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.volume != null ? `${c.volume} ${tipos.find(t => t.id === c.tipoMateriaPrimaId)?.unidade ?? ''}` : '—'}</TableCell>
                      </>
                    )
                    : <TableCell className="text-right font-medium tabular-nums">{fmt(c.valorMonetario)}</TableCell>
                  }
                  <TableCell className="text-xs text-muted-foreground">
                    {format(parseISO(c.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  {podeEditar && (
                    <TableCell>
                      <button
                        onClick={() => void handleRemover(c.id)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      {podeEditar && !formAberto && (
        <Button size="sm" variant="outline" onClick={() => setFormAberto(true)}>
          <Plus className="h-3.5 w-3.5" /> {isProducao ? 'Registrar Colheita' : 'Registrar Contribuição'}
        </Button>
      )}

      {formAberto && (
        isProducao
          ? <ProducaoForm
              campanhaId={campanhaId}
              tipos={tipos}
              associados={associados}
              isPending={isPending}
              criarColheita={criarColheita}
              onClose={() => setFormAberto(false)}
            />
          : <AquisicaoForm
              associados={associados}
              isPending={isPending}
              registrar={registrar}
              onClose={() => setFormAberto(false)}
            />
      )}
    </div>
  )

  async function handleRemover(id: string) {
    try { await remover(id); toast.success('Contribuição removida.') }
    catch { toast.error('Erro ao remover contribuição.') }
  }
}

// ─── Formulário PRODUCAO (colheita) ──────────────────────────────────────────

function ProducaoForm({ campanhaId, tipos, associados, isPending, criarColheita, onClose }: {
  campanhaId: string
  tipos: { id: string; nome: string; unidade: string }[]
  associados: { id: string; usuario: { nome: string } }[]
  isPending: boolean
  criarColheita: (input: Parameters<ReturnType<typeof useCriarColheita>['mutateAsync']>[0]) => Promise<{ id: string }>
  onClose: () => void
}) {
  const qc = useQueryClient()
  const form = useForm<FormProducao>({
    resolver: zodResolver(schemaProducao),
    defaultValues: { dataColheita: new Date().toISOString().slice(0, 10) },
  })
  const tipoMateriaPrimaId = form.watch('tipoMateriaPrimaId')
  const tipoSelecionado = tipos.find(t => t.id === tipoMateriaPrimaId)

  async function onSubmit(data: FormProducao) {
    try {
      await criarColheita({
        associadoId: data.associadoId,
        tipoMateriaPrimaId: data.tipoMateriaPrimaId,
        volume: data.volume,
        unidade: tipoSelecionado?.unidade ?? 'KG',
        dataColheita: data.dataColheita ?? new Date().toISOString().slice(0, 10),
        campanhaId,
        observacao: data.descricao || undefined,
      })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'contribuicoes'] })
      toast.success('Colheita registrada.')
      onClose()
    } catch {
      toast.error('Erro ao registrar colheita.')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
      <p className="text-sm font-medium">Nova Colheita</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Associado *</Label>
          <Controller control={form.control} name="associadoId" render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? undefined} disabled={isPending}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {associados.map(a => <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {form.formState.errors.associadoId && (
            <p className="text-xs text-destructive">{form.formState.errors.associadoId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Tipo de Matéria-Prima *</Label>
          <Controller control={form.control} name="tipoMateriaPrimaId" render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? undefined} disabled={isPending}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {tipos.map(t => <SelectItem key={t.id} value={t.id}>{t.nome} ({t.unidade})</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {form.formState.errors.tipoMateriaPrimaId && (
            <p className="text-xs text-destructive">{form.formState.errors.tipoMateriaPrimaId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Controller control={form.control} name="volume" render={({ field, fieldState }) => (
          <DecimalInput
            id="volume" label="Volume *" decimals={3} min={0.001}
            value={field.value} onChange={field.onChange}
            error={fieldState.error?.message} disabled={isPending}
          />
        )} />
        <div className="space-y-1.5">
          <Label>Unidade</Label>
          <Input readOnly value={tipoSelecionado?.unidade ?? '—'} className="bg-muted text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dataColheita">Data</Label>
          <Input id="dataColheita" type="date" {...form.register('dataColheita')} disabled={isPending} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
        <Textarea rows={1} className="resize-none" {...form.register('descricao')} disabled={isPending} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>{isPending ? 'Salvando…' : 'Salvar'}</Button>
        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}

// ─── Formulário AQUISICAO (dinheiro) ─────────────────────────────────────────

function AquisicaoForm({ associados, isPending, registrar, onClose }: {
  associados: { id: string; usuario: { nome: string } }[]
  isPending: boolean
  registrar: (input: Parameters<ReturnType<typeof useRegistrarContribuicao>['mutateAsync']>[0]) => Promise<unknown>
  onClose: () => void
}) {
  const form = useForm<FormAquisicao>({ resolver: zodResolver(schemaAquisicao) })

  async function onSubmit(data: FormAquisicao) {
    try {
      await registrar({
        associadoId: data.associadoId,
        tipo: 'DINHEIRO',
        valorMonetario: data.valorMonetario,
        descricao: data.descricao || undefined,
      })
      toast.success('Contribuição registrada.')
      onClose()
    } catch {
      toast.error('Erro ao registrar contribuição.')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
      <p className="text-sm font-medium">Nova Contribuição</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Associado *</Label>
          <Controller control={form.control} name="associadoId" render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? undefined} disabled={isPending}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {associados.map(a => <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {form.formState.errors.associadoId && (
            <p className="text-xs text-destructive">{form.formState.errors.associadoId.message}</p>
          )}
        </div>

        <Controller control={form.control} name="valorMonetario" render={({ field, fieldState }) => (
          <CurrencyInput
            label="Valor (R$) *"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={isPending}
          />
        )} />
      </div>

      <div className="space-y-1.5">
        <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
        <Textarea rows={1} className="resize-none" {...form.register('descricao')} disabled={isPending} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>{isPending ? 'Salvando…' : 'Salvar'}</Button>
        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}
