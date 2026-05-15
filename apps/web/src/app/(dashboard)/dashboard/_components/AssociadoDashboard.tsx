'use client'

import * as React from 'react'
import { Package, BarChart2, Droplets } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMeuPerfil } from '@/hooks/useAssociados'
import { useAtribuicoesPorAssociado } from '@/hooks/useAtribuicoes'
import { useColheitasPorAssociado } from '@/hooks/useProducao'

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
