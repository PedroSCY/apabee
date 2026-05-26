'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDownRight, ArrowUpRight, Download, FileText, Plus, RefreshCw, Sheet } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared'
import { useAssociados } from '@/hooks/useAssociados'
import { useCampanhas } from '@/hooks/useCampanhas'
import { useMovimentos, useRegistrarMovimento } from '@/hooks/useFinanceiro'
import { financeiroApi, type TipoMovimento } from '@/lib/api/financeiro'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const TIPO_CONFIG: Record<TipoMovimento, { label: string; cor: string; icone: 'up' | 'down' | 'neutral' }> = {
  MENSALIDADE: { label: 'Mensalidade', cor: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400', icone: 'up' },
  ANTECIPACAO: { label: 'Antecipação', cor: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400', icone: 'neutral' },
  RATEIO_FINAL: { label: 'Rateio Final', cor: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400', icone: 'up' },
  CUSTO: { label: 'Custo', cor: 'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400', icone: 'down' },
}

type FiltroTipo = 'TODOS' | TipoMovimento

// ── Dialog de novo lançamento ─────────────────────────────────────────────

interface NovoLancamentoDialogProps {
  open: boolean
  onClose: () => void
}

function NovoLancamentoDialog({ open, onClose }: NovoLancamentoDialogProps) {
  const { data: associados = [] } = useAssociados()
  const { data: campanhas = [] } = useCampanhas()
  const { mutate, isPending } = useRegistrarMovimento()

  const [tipo, setTipo] = React.useState<'ANTECIPACAO' | 'CUSTO'>('ANTECIPACAO')
  const [associadoId, setAssociadoId] = React.useState('')
  const [campanhaId, setCampanhaId] = React.useState('NENHUMA')
  const [valor, setValor] = React.useState('')
  const [descricao, setDescricao] = React.useState('')
  const [data, setData] = React.useState(format(new Date(), 'yyyy-MM-dd'))

  function resetForm() {
    setTipo('ANTECIPACAO')
    setAssociadoId('')
    setCampanhaId('NENHUMA')
    setValor('')
    setDescricao('')
    setData(format(new Date(), 'yyyy-MM-dd'))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valorNum = parseFloat(valor.replace(',', '.'))
    if (!associadoId || isNaN(valorNum) || valorNum <= 0) return

    mutate(
      {
        tipo,
        associadoId,
        campanhaId: campanhaId === 'NENHUMA' ? undefined : campanhaId,
        valor: valorNum,
        descricao: descricao.trim() || undefined,
        data: data || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Lançamento registrado com sucesso.')
          resetForm()
          onClose()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as 'ANTECIPACAO' | 'CUSTO')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANTECIPACAO">Antecipação</SelectItem>
                <SelectItem value="CUSTO">Custo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Associado</Label>
            <Select value={associadoId} onValueChange={setAssociadoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o associado" />
              </SelectTrigger>
              <SelectContent>
                {associados.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Campanha <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Select value={campanhaId} onValueChange={setCampanhaId}>
              <SelectTrigger>
                <SelectValue placeholder="Sem campanha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NENHUMA">Sem campanha</SelectItem>
                {campanhas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              placeholder="Descrição do lançamento"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !associadoId || !valor}>
              {isPending ? 'Salvando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Seção principal ───────────────────────────────────────────────────────

export function MovimentosSection() {
  const [filtroTipo, setFiltroTipo] = React.useState<FiltroTipo>('TODOS')
  const [filtroAssociado, setFiltroAssociado] = React.useState<string>('TODOS')
  const [dialogAberto, setDialogAberto] = React.useState(false)
  const [exportando, setExportando] = React.useState(false)

  const { data: movimentos = [], isLoading, refetch, isFetching } = useMovimentos({ limit: 200 })
  const { data: associados = [] } = useAssociados()

  const nomeMap = React.useMemo(
    () => Object.fromEntries(associados.map((a) => [a.id, a.usuario.nome])),
    [associados],
  )

  const filtrados = React.useMemo(() => {
    return movimentos.filter((m) => {
      if (filtroTipo !== 'TODOS' && m.tipo !== filtroTipo) return false
      if (filtroAssociado !== 'TODOS' && m.associadoId !== filtroAssociado) return false
      return true
    })
  }, [movimentos, filtroTipo, filtroAssociado])

  const totalEntradas = filtrados.filter((m) => m.valor > 0).reduce((s, m) => s + m.valor, 0)
  const totalSaidas = filtrados.filter((m) => m.valor < 0).reduce((s, m) => s + Math.abs(m.valor), 0)

  async function exportar(formato: 'csv' | 'pdf') {
    setExportando(true)
    try {
      await financeiroApi.exportarMovimentos({
        formato,
        associadoId: filtroAssociado !== 'TODOS' ? filtroAssociado : undefined,
        tipo: filtroTipo !== 'TODOS' ? filtroTipo : undefined,
      })
    } catch {
      toast.error('Erro ao exportar movimentos.')
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="space-y-4">
      <NovoLancamentoDialog open={dialogAberto} onClose={() => setDialogAberto(false)} />

      {/* Totalizadores */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Entradas</p>
            <p className="text-lg font-bold text-emerald-600">{fmt(totalEntradas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Saídas</p>
            <p className="text-lg font-bold text-red-500">{fmt(totalSaidas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p className={`text-lg font-bold ${totalEntradas - totalSaidas >= 0 ? 'text-foreground' : 'text-red-500'}`}>
              {fmt(totalEntradas - totalSaidas)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium">Extrato de Movimentos</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filtroAssociado} onValueChange={setFiltroAssociado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os associados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os associados</SelectItem>
                  {associados.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as FiltroTipo)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os tipos</SelectItem>
                  <SelectItem value="MENSALIDADE">Mensalidade</SelectItem>
                  <SelectItem value="ANTECIPACAO">Antecipação</SelectItem>
                  <SelectItem value="RATEIO_FINAL">Rateio Final</SelectItem>
                  <SelectItem value="CUSTO">Custo</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" disabled={exportando}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => void exportar('csv')}>
                    <Sheet className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void exportar('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" onClick={() => setDialogAberto(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Novo lançamento
              </Button>

              <Button size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <EmptyState
              title="Nenhum movimento"
              description="Nenhum movimento financeiro encontrado para os filtros selecionados."
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Associado</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((m) => {
                  const cfg = TIPO_CONFIG[m.tipo]
                  const isPositivo = m.valor >= 0
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(parseISO(m.data as unknown as string), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {nomeMap[m.associadoId] ?? m.associadoId.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                        {m.descricao ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cfg.cor}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`flex items-center justify-end gap-1 text-sm font-semibold tabular-nums ${
                          isPositivo ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {isPositivo
                            ? <ArrowUpRight className="h-3.5 w-3.5" />
                            : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {isPositivo ? '' : '−'}{fmt(Math.abs(m.valor))}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
