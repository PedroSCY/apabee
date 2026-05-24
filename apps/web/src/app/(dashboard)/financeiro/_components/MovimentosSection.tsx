'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDownRight, ArrowUpRight, DollarSign, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared'
import { useAssociados } from '@/hooks/useAssociados'
import { useMovimentos } from '@/hooks/useFinanceiro'
import type { TipoMovimento } from '@/lib/api/financeiro'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const TIPO_CONFIG: Record<TipoMovimento, { label: string; cor: string; icone: 'up' | 'down' | 'neutral' }> = {
  MENSALIDADE: { label: 'Mensalidade', cor: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400', icone: 'up' },
  ANTECIPACAO: { label: 'Antecipação', cor: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400', icone: 'neutral' },
  RATEIO_FINAL: { label: 'Rateio Final', cor: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400', icone: 'up' },
  CUSTO: { label: 'Custo', cor: 'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400', icone: 'down' },
}

type FiltroTipo = 'TODOS' | TipoMovimento

export function MovimentosSection() {
  const [filtroTipo, setFiltroTipo] = React.useState<FiltroTipo>('TODOS')
  const [filtroAssociado, setFiltroAssociado] = React.useState<string>('TODOS')

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

  return (
    <div className="space-y-4">
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
