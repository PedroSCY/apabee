'use client'

import * as React from 'react'
import Link from 'next/link'
import { Package, BarChart2, Droplets, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useMeuPerfil } from '@/hooks/useAssociados'
import { useAtribuicoesPorAssociado } from '@/hooks/useAtribuicoes'
import { useColheitasPorAssociado } from '@/hooks/useProducao'
import { useMinhasMensalidades } from '@/hooks/useFinanceiro'

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function AssociadoDashboard() {
  const { data: meuPerfil, isLoading: loadingPerfil } = useMeuPerfil()
  const meuId = meuPerfil?.id ?? ''

  const { data: atribuicoes = [], isLoading: loadingAtrib } = useAtribuicoesPorAssociado(meuId)
  const { data: colheitas = [], isLoading: loadingColheitas } = useColheitasPorAssociado(meuId)
  const { data: mensalidades = [] } = useMinhasMensalidades()
  const mensalidadesPendentes = mensalidades.filter((m) => m.status === 'PENDENTE')

  const emprestimosAtivos = atribuicoes.filter((a) => a.status === 'ATIVO').length

  const anoAtual = new Date().getFullYear()
  const colheitasAno = colheitas.filter(
    (c) => new Date(c.dataColheita).getFullYear() === anoAtual,
  )
  const volumeTotal = colheitasAno.reduce((sum, c) => sum + c.volume, 0)
  const unidadePrincipal = colheitasAno[0]?.unidade ?? 'kg'
  const volumeLabel = volumeTotal > 0 ? `${volumeTotal.toLocaleString('pt-BR')} ${unidadePrincipal}` : '0 kg'

  const loading = loadingPerfil || loadingAtrib

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          title="Itens emprestados"
          value={emprestimosAtivos}
          icon={Package}
          loading={loading}
        />
        <StatCard
          title="Colheitas este ano"
          value={loadingColheitas ? '…' : colheitasAno.length}
          icon={BarChart2}
          loading={loadingColheitas && !meuId}
        />
        <StatCard
          title="Volume colhido (ano)"
          value={loadingColheitas ? '…' : volumeLabel}
          icon={Droplets}
          loading={loadingColheitas && !meuId}
        />
      </div>

      {mensalidadesPendentes.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                  {mensalidadesPendentes.length === 1
                    ? 'Você tem 1 mensalidade em aberto'
                    : `Você tem ${mensalidadesPendentes.length} mensalidades em aberto`}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Entre em contato com a associação para regularizar sua situação.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild className="shrink-0 border-amber-300 dark:border-amber-700">
              <Link href="/financeiro">Ver detalhes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Próxima Reunião</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma reunião agendada. As atas e datas estarão disponíveis na seção{' '}
            <span className="font-medium text-foreground">Documentos</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
