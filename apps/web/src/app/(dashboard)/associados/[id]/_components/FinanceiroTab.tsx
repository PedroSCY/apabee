'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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

export function FinanceiroTab({ associadoId }: Props) {
  const { data: movimentos = [], isLoading } = useMovimentosPorAssociado(associadoId)

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
          <CardTitle className="text-base">Histórico de Movimentos</CardTitle>
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
