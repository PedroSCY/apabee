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
import { CurrencyInput, EmptyState } from '@/components/shared'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useContribuicoes, useRegistrarContribuicao, useRemoverContribuicao } from '@/hooks/useCampanhas'
import { useAssociados } from '@/hooks/useAssociados'
import type { StatusCampanha, TipoContribuicao } from '@/lib/api/campanhas'

const TIPOS: Array<{ value: TipoContribuicao; label: string }> = [
  { value: 'COLHEITA', label: 'Colheita' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'MAO_DE_OBRA', label: 'Mão de Obra' },
  { value: 'CONSUMIVEL', label: 'Consumível' },
  { value: 'EQUIPAMENTO', label: 'Equipamento' },
  { value: 'ACORDO', label: 'Acordo' },
]

const schema = z.object({
  associadoId: z.string().min(1, 'Selecione um associado'),
  tipo: z.enum(['COLHEITA', 'DINHEIRO', 'MAO_DE_OBRA', 'CONSUMIVEL', 'EQUIPAMENTO', 'ACORDO']),
  valorMonetario: z.number().positive('Valor deve ser positivo'),
  descricao: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
}

export function ContribuicoesTab({ campanhaId, statusCampanha }: Props) {
  const [formAberto, setFormAberto] = React.useState(false)
  const { data: contribuicoes = [], isLoading } = useContribuicoes(campanhaId)
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: registrar, isPending: registrando } = useRegistrarContribuicao(campanhaId)
  const { mutateAsync: remover } = useRemoverContribuicao(campanhaId)

  const podeEditar = statusCampanha === 'ATIVA' || statusCampanha === 'PLANEJADA'

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'DINHEIRO', descricao: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      await registrar(data)
      toast.success('Contribuição registrada.')
      form.reset()
      setFormAberto(false)
    } catch {
      toast.error('Erro ao registrar contribuição.')
    }
  }

  async function handleRemover(id: string) {
    try { await remover(id); toast.success('Contribuição removida.') }
    catch { toast.error('Erro ao remover contribuição.') }
  }

  const nomeAssociado = (id: string) => associados.find(a => a.id === id)?.usuario.nome ?? id.slice(0, 8)

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
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                {podeEditar && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contribuicoes.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{nomeAssociado(c.associadoId)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {TIPOS.find(t => t.value === c.tipo)?.label ?? c.tipo}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.descricao ?? '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(parseISO(c.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{fmt(c.valorMonetario)}</TableCell>
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
          <Plus className="h-3.5 w-3.5" /> Adicionar Contribuição
        </Button>
      )}

      {formAberto && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
          <p className="text-sm font-medium">Nova Contribuição</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Associado *</Label>
              <Controller control={form.control} name="associadoId" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={registrando}>
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
              <Label>Tipo *</Label>
              <Controller control={form.control} name="tipo" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={registrando}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={form.control}
              name="valorMonetario"
              render={({ field, fieldState }) => (
                <CurrencyInput
                  label="Valor Monetário (R$) *"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={registrando}
                />
              )}
            />
            <div className="space-y-1.5">
              <Label>Descrição <span className="text-muted-foreground">(opcional)</span></Label>
              <Textarea rows={1} className="resize-none" {...form.register('descricao')} disabled={registrando} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={registrando}>
              {registrando ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={registrando} onClick={() => { setFormAberto(false); form.reset() }}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
