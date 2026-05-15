'use client'

import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCampanhas, useCotas } from '@/hooks/useCampanhas'
import { useMeuPerfil } from '@/hooks/useAssociados'
import type { CampanhaResponse, StatusCampanha, TipoCampanha } from '@/lib/api/campanhas'

const STATUS_CONFIG: Record<StatusCampanha, { label: string; className: string }> = {
  PLANEJADA: { label: 'Planejada', className: 'bg-slate-100 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300' },
  ATIVA: { label: 'Ativa', className: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
  CONCLUIDA: { label: 'Concluída', className: 'bg-purple-100 text-purple-700 border-transparent dark:bg-purple-950 dark:text-purple-400' },
  LIQUIDADA: { label: 'Liquidada', className: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400' },
  CANCELADA: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500 border-transparent dark:bg-gray-900 dark:text-gray-400' },
}

const TIPO_CONFIG: Record<TipoCampanha, { label: string; className: string }> = {
  PRODUCAO: { label: 'Produção', className: 'bg-indigo-100 text-indigo-700 border-transparent dark:bg-indigo-950 dark:text-indigo-400' },
  AQUISICAO: { label: 'Aquisição', className: 'bg-orange-100 text-orange-700 border-transparent dark:bg-orange-950 dark:text-orange-400' },
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function fmtDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

// Sub-componente por campanha AQUISICAO — chama seu próprio hook sem violar Rules of Hooks
function CotaInfo({ campanhaId, associadoId }: { campanhaId: string; associadoId: string }) {
  const { data: cotas = [] } = useCotas(campanhaId)
  const minhaCota = cotas.find(c => c.associadoId === associadoId)

  if (!minhaCota) return null

  return (
    <p className="text-xs flex items-center gap-1">
      {minhaCota.pago ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          <span className="text-emerald-600 font-medium">Cota paga: {fmt(minhaCota.valor)}</span>
        </>
      ) : (
        <>
          <Clock className="h-3 w-3 text-amber-600" />
          <span className="text-amber-600 font-medium">Cota pendente: {fmt(minhaCota.valor)}</span>
        </>
      )}
    </p>
  )
}

function CampanhaCard({ campanha, associadoId }: { campanha: CampanhaResponse; associadoId: string }) {
  const sCfg = STATUS_CONFIG[campanha.status]
  const tCfg = TIPO_CONFIG[campanha.tipo]

  return (
    <Link href={`/campanhas/${campanha.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-tight">{campanha.nome}</CardTitle>
            <Badge variant="outline" className={sCfg.className}>{sCfg.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={tCfg.className}>{tCfg.label}</Badge>
            <span className="font-mono text-xs text-muted-foreground">{campanha.codigo}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Início: <span className="text-foreground font-medium">{fmtDate(campanha.dataInicio)}</span>
            {campanha.dataFim && (
              <> — Fim: <span className="text-foreground font-medium">{fmtDate(campanha.dataFim)}</span></>
            )}
          </p>
          {campanha.tipo === 'AQUISICAO' && campanha.valorMeta && (
            <p className="text-xs text-muted-foreground">
              Meta: <span className="text-foreground font-medium">{fmt(campanha.valorMeta)}</span>
            </p>
          )}
          {campanha.receitaTotal > 0 && (
            <p className="text-xs text-muted-foreground">
              Receita: <span className="text-emerald-600 font-medium">{fmt(campanha.receitaTotal)}</span>
            </p>
          )}
          {campanha.tipo === 'AQUISICAO' && (
            <CotaInfo campanhaId={campanha.id} associadoId={associadoId} />
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function AssociadoCampanhas() {
  const { data: campanhas = [], isLoading } = useCampanhas()
  const { data: meuPerfil } = useMeuPerfil()
  const meuAssociadoId = meuPerfil?.id ?? ''

  const visiveis = campanhas.filter(c => c.status !== 'CANCELADA')

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
      </div>
    )
  }

  if (visiveis.length === 0) {
    return (
      <EmptyState
        title="Nenhuma campanha disponível"
        description="As campanhas ativas aparecerão aqui quando o administrador criá-las."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visiveis.map(c => (
        <CampanhaCard key={c.id} campanha={c} associadoId={meuAssociadoId} />
      ))}
    </div>
  )
}
