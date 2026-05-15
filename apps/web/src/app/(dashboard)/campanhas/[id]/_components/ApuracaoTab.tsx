'use client'

import * as React from 'react'
import { BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared'
import { useApuracao, useCalcularPreviewRateio } from '@/hooks/useCampanhas'
import { useAssociados } from '@/hooks/useAssociados'
import type { StatusCampanha, ApuracaoParticipante } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`

type Associado = { id: string; usuario: { nome: string } }

function ParticipantesTable({ participantes, associados }: {
  participantes: ApuracaoParticipante[]
  associados: Associado[]
}) {
  const nome = (id: string) => associados.find(a => a.id === id)?.usuario.nome ?? id.slice(0, 8)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Associado</TableHead>
          <TableHead className="text-right">Contribuição</TableHead>
          <TableHead className="text-right">%</TableHead>
          <TableHead className="text-right">Bruto</TableHead>
          <TableHead className="text-right">Custos</TableHead>
          <TableHead className="text-right">Antecipações</TableHead>
          <TableHead className="text-right font-semibold">Final</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participantes.map(p => (
          <TableRow key={p.associadoId}>
            <TableCell className="font-medium">{nome(p.associadoId)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmt(p.contribuicaoTotal)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtPct(p.percentual)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmt(p.valorBruto)}</TableCell>
            <TableCell className="text-right tabular-nums text-rose-600">−{fmt(p.custosRateados)}</TableCell>
            <TableCell className="text-right tabular-nums text-amber-600">−{fmt(p.antecipacoes)}</TableCell>
            <TableCell className={`text-right tabular-nums font-semibold ${p.valorFinal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(p.valorFinal)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
}

export function ApuracaoTab({ campanhaId, statusCampanha }: Props) {
  const { data: associados = [] } = useAssociados()
  const { data: apuracao, isLoading } = useApuracao(campanhaId, { enabled: statusCampanha === 'LIQUIDADA' })
  const { mutateAsync: calcularPreview, data: preview, isPending: calculando } = useCalcularPreviewRateio(campanhaId)

  if (statusCampanha !== 'CONCLUIDA' && statusCampanha !== 'LIQUIDADA') {
    return (
      <EmptyState
        title="Apuração não disponível"
        description="A apuração estará disponível após a campanha ser concluída."
        className="py-8"
      />
    )
  }

  if (statusCampanha === 'LIQUIDADA') {
    if (isLoading) return <Skeleton className="h-32 w-full" />
    if (!apuracao) return (
      <EmptyState
        title="Apuração não encontrada"
        description="Os dados de apuração não estão disponíveis para esta campanha."
        className="py-8"
      />
    )
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-lg border border-border p-4">
          <div>
            <p className="text-xs text-muted-foreground">Faturamento Total</p>
            <p className="text-sm font-semibold text-emerald-600">{fmt(apuracao.faturamentoTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Custo Total</p>
            <p className="text-sm font-semibold text-rose-600">{fmt(apuracao.custoTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lucro Líquido</p>
            <p className={`text-sm font-semibold ${apuracao.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(apuracao.lucroLiquido)}
            </p>
          </div>
        </div>
        <ParticipantesTable participantes={apuracao.participantes} associados={associados} />
      </div>
    )
  }

  // CONCLUIDA — preview antes da liquidação
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Calcule um preview do rateio antes de liquidar. A liquidação é feita pelo botão no cabeçalho.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try { await calcularPreview() }
            catch (e) { toast.error((e as ApiError).message ?? 'Erro ao calcular preview.') }
          }}
          disabled={calculando}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          {calculando ? 'Calculando…' : 'Calcular Preview'}
        </Button>
      </div>
      {preview && (
        <ParticipantesTable participantes={preview.participantes} associados={associados} />
      )}
    </div>
  )
}
