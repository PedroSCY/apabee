import { Package, Layers, TrendingUp, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ASSOCIADO_STATS } from '../_mock/dashboard.mock'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string | number
  icon: React.ElementType
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
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

export function AssociadoDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Empréstimos ativos"
          value={ASSOCIADO_STATS.emprestimosAtivos}
          icon={Package}
        />
        <StatCard
          title="Lotes abertos"
          value={ASSOCIADO_STATS.lotesAbertos}
          icon={Layers}
        />
        <StatCard
          title="Contribuição YTD"
          value={`${ASSOCIADO_STATS.contribuicaoYTD} kg`}
          icon={TrendingUp}
        />
        <StatCard
          title="Receita estimada"
          value={fmt(ASSOCIADO_STATS.receitaEstimada)}
          icon={Coins}
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
