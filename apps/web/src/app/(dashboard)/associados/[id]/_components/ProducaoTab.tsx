'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { StatusBadge, EmptyState } from '@/components/shared'
import {
  useColheitasPorAssociado,
  useParticipacoesPorAssociado,
  useAtualizarParticipacao,
  useLotes,
  useTiposMateriaPrima,
} from '@/hooks/useProducao'
import type { ParticipacaoLoteResponse } from '@/lib/api/producao'
import { RegistrarColheitaDialog } from './RegistrarColheitaDialog'

interface Props {
  associadoId: string
}

const editSchema = z.object({
  percentual: z.number().min(0).max(100),
  volume: z.number().min(0).optional(),
  valorInvestido: z.number().min(0).optional(),
})
type EditData = z.infer<typeof editSchema>

function formatDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

export function ProducaoTab({ associadoId }: Props) {
  const [colheitaOpen, setColheitaOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ParticipacaoLoteResponse | null>(null)

  const { data: colheitas = [], isLoading: loadingC } = useColheitasPorAssociado(associadoId)
  const { data: participacoes = [], isLoading: loadingP } = useParticipacoesPorAssociado(associadoId)
  const { data: lotes = [], isLoading: loadingL } = useLotes()
  const { data: tipos = [], isLoading: loadingT } = useTiposMateriaPrima()
  const { mutateAsync: atualizar, isPending: salvando } = useAtualizarParticipacao()

  const isLoading = loadingC || loadingP || loadingL || loadingT

  function getLote(id: string) { return lotes.find((l) => l.id === id) }
  function getTipo(id: string) { return tipos.find((t) => t.id === id) }

  const form = useForm<EditData>({
    resolver: zodResolver(editSchema),
    defaultValues: { percentual: 0, volume: undefined, valorInvestido: undefined },
  })

  function openEdit(p: ParticipacaoLoteResponse) {
    setEditTarget(p)
    form.reset({ percentual: p.percentual, volume: p.volume ?? undefined, valorInvestido: p.valorInvestido ?? undefined })
  }

  async function onSubmit(data: EditData) {
    if (!editTarget) return
    const lote = getLote(editTarget.loteProducaoId)
    try {
      await atualizar({
        loteId: editTarget.loteProducaoId,
        associadoId,
        input: { percentual: data.percentual, volume: data.volume, valorInvestido: data.valorInvestido },
      })
      toast.success(`Participação no lote "${lote?.periodo ?? ''}" atualizada.`)
      setEditTarget(null)
    } catch {
      toast.error('Erro ao atualizar participação.')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Colheitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Colheitas</CardTitle>
          <Button size="sm" onClick={() => setColheitaOpen(true)}>
            <Plus className="h-4 w-4" /> Registrar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {colheitas.length === 0 ? (
            <EmptyState title="Nenhuma colheita registrada" className="py-10" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colheitas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{getTipo(c.tipoMateriaPrimaId)?.nome ?? '—'}</TableCell>
                    <TableCell>{c.volume} {c.unidade}</TableCell>
                    <TableCell>{getLote(c.loteProducaoId)?.periodo ?? '—'}</TableCell>
                    <TableCell>{formatDate(c.dataColheita)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.observacao ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Participações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Participações em Lotes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {participacoes.length === 0 ? (
            <EmptyState title="Nenhuma participação registrada" className="py-10" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Percentual</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Valor Investido</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {participacoes.map((p) => {
                  const lote = getLote(p.loteProducaoId)
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{lote?.periodo ?? '—'}</TableCell>
                      <TableCell>{lote?.tipo ?? '—'}</TableCell>
                      <TableCell>{lote ? <StatusBadge status={lote.status} /> : '—'}</TableCell>
                      <TableCell className="text-right">{p.percentual}%</TableCell>
                      <TableCell className="text-right">{p.volume != null ? `${p.volume} kg` : '—'}</TableCell>
                      <TableCell className="text-right">
                        {p.valorInvestido != null ? `R$ ${p.valorInvestido.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RegistrarColheitaDialog open={colheitaOpen} onOpenChange={setColheitaOpen} associadoId={associadoId} />

      {/* Dialog editar participação */}
      <Dialog open={editTarget !== null} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Participação</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="percentual" render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentual (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" max="100"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="volume" render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="valorInvestido" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Investido (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={salvando}>Cancelar</Button>
                <Button type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
