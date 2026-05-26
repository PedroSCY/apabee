'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared'
import { useMovimentosPorAssociado } from '@/hooks/useFinanceiro'
import { financeiroApi } from '@/lib/api/financeiro'
import { MensalidadesAssociadoSection } from './MensalidadesAssociadoSection'

interface Props {
  associadoId: string
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const TIPO_CONFIG: Record<string, { label: string; className: string; sign: number }> = {
  ANTECIPACAO: {
    label: 'Antecipação',
    className: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400',
    sign: -1,
  },
  RATEIO_FINAL: {
    label: 'Rateio Final',
    className: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400',
    sign: 1,
  },
  CUSTO: {
    label: 'Custo',
    className: 'bg-orange-100 text-orange-700 border-transparent dark:bg-orange-950 dark:text-orange-400',
    sign: -1,
  },
  MENSALIDADE: {
    label: 'Mensalidade',
    className: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400',
    sign: -1,
  },
}

interface KpiCardProps {
  title: string
  value: string
  icon: React.ElementType
  valueClass?: string
}

function KpiCard({ title, value, icon: Icon, valueClass }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className={`text-lg font-semibold ${valueClass ?? ''}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const ANO_ATUAL = new Date().getFullYear()
const ANOS_EXTRATO = Array.from({ length: 4 }, (_, i) => ANO_ATUAL - i)

export function FinanceiroTab({ associadoId }: Props) {
  const [anoExtrato, setAnoExtrato] = React.useState(ANO_ATUAL)
  const [baixando, setBaixando] = React.useState(false)

  const { data: movimentos = [], isLoading } = useMovimentosPorAssociado(associadoId)

  async function baixarExtrato() {
    setBaixando(true)
    try {
      await financeiroApi.exportarExtratoAssociado(associadoId, anoExtrato)
    } catch {
      toast.error('Erro ao baixar extrato.')
    } finally {
      setBaixando(false)
    }
  }

  const totalAntecipacoes = movimentos
    .filter((m) => m.tipo === 'ANTECIPACAO')
    .reduce((acc, m) => acc + m.valor, 0)

  const totalRateios = movimentos
    .filter((m) => m.tipo === 'RATEIO_FINAL')
    .reduce((acc, m) => acc + m.valor, 0)

  const saldo = totalRateios - totalAntecipacoes

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <MensalidadesAssociadoSection associadoId={associadoId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total de Antecipações"
          value={fmt(totalAntecipacoes)}
          icon={TrendingDown}
          valueClass="text-amber-600"
        />
        <KpiCard
          title="Total de Rateios"
          value={fmt(totalRateios)}
          icon={TrendingUp}
          valueClass="text-emerald-600"
        />
        <KpiCard
          title="Saldo Final"
          value={fmt(saldo)}
          icon={Wallet}
          valueClass={saldo >= 0 ? 'text-emerald-600' : 'text-destructive'}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Histórico de Movimentos</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={String(anoExtrato)} onValueChange={(v) => setAnoExtrato(Number(v))}>
                <SelectTrigger className="w-22.5 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANOS_EXTRATO.map((a) => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => void baixarExtrato()} disabled={baixando}>
                <Download className="h-3.5 w-3.5 mr-1" />
                {baixando ? 'Baixando…' : 'Extrato PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {movimentos.length === 0 ? (
            <EmptyState
              title="Nenhum movimento financeiro"
              description="Os movimentos são gerados automaticamente pelo sistema."
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentos
                  .slice()
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((m) => {
                    const config = TIPO_CONFIG[m.tipo]
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <Badge variant="outline" className={config.className}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.campanhaId ?? '—'}</TableCell>
                        <TableCell>
                          {format(parseISO(m.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium tabular-nums ${
                            m.tipo === 'ANTECIPACAO' ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {m.tipo === 'ANTECIPACAO' ? '−' : '+'} {fmt(m.valor)}
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
