'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Play, CheckCheck, X, Banknote, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog, PageHeader } from '@/components/shared'
import {
  useCampanha,
  useIniciarCampanha,
  useConcluirCampanha,
  useCancelarCampanha,
  useLiquidarCampanha,
  useDeletarCampanha,
} from '@/hooks/useCampanhas'
import type { StatusCampanha, TipoCampanha } from '@/lib/api/campanhas'
import { ContribuicoesTab } from '../../_components/ContribuicoesTab'
import { CustosTab } from '../../_components/CustosTab'
import { OrdensProducaoTab } from './OrdensProducaoTab'
import { CotasTab } from './CotasTab'
import { ItensAquisicaoTab } from './ItensAquisicaoTab'
import { ApuracaoTab } from './ApuracaoTab'

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

interface Props {
  campanhaId: string
  isAdmin: boolean
}

export function CampanhaDetalhePage({ campanhaId, isAdmin }: Props) {
  const router = useRouter()
  const { data: campanha, isLoading } = useCampanha(campanhaId)
  const [confirmCancelar, setConfirmCancelar] = React.useState(false)
  const [confirmLiquidar, setConfirmLiquidar] = React.useState(false)
  const [confirmDeletar, setConfirmDeletar] = React.useState(false)

  const { mutateAsync: iniciar, isPending: iniciando } = useIniciarCampanha()
  const { mutateAsync: concluir, isPending: concluindo } = useConcluirCampanha()
  const { mutateAsync: cancelar, isPending: cancelando } = useCancelarCampanha()
  const { mutateAsync: liquidar, isPending: liquidando } = useLiquidarCampanha()
  const { mutateAsync: deletar, isPending: deletando } = useDeletarCampanha()

  const isPending = iniciando || concluindo || cancelando || liquidando || deletando

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!campanha) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Campanha não encontrada.</p>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[campanha.status]
  const tipoCfg = TIPO_CONFIG[campanha.tipo]
  const resultado = campanha.receitaTotal - campanha.custoTotal

  async function handleIniciar() {
    try { await iniciar(campanha!.id); toast.success('Campanha iniciada.') }
    catch { toast.error('Erro ao iniciar campanha.') }
  }

  async function handleConcluir() {
    try { await concluir(campanha!.id); toast.success('Campanha concluída.') }
    catch { toast.error('Erro ao concluir campanha.') }
  }

  async function handleCancelar() {
    try { await cancelar(campanha!.id); toast.success('Campanha cancelada.') }
    catch { toast.error('Erro ao cancelar campanha.') }
  }

  async function handleLiquidar() {
    try { await liquidar(campanha!.id); toast.success('Campanha liquidada e rateio gerado.') }
    catch { toast.error('Erro ao liquidar campanha.') }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href="/campanhas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-3.5" /> Voltar às Campanhas
        </Link>
        <PageHeader
          title={campanha.nome}
          description={
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{campanha.codigo}</span>
              <Badge variant="outline" className={tipoCfg.className}>{tipoCfg.label}</Badge>
              <Badge variant="outline" className={statusCfg.className}>{statusCfg.label}</Badge>
            </span>
          }
        />
      </div>

      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="text-sm font-medium">
              {fmtDate(campanha.dataInicio)}
              {campanha.dataFim ? ` → ${fmtDate(campanha.dataFim)}` : ' → em aberto'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="text-sm font-medium text-emerald-600">{fmt(campanha.receitaTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Custo</p>
            <p className="text-sm font-medium text-rose-600">{fmt(campanha.custoTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Resultado</p>
            <p className={`text-sm font-semibold ${resultado >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(resultado)}
            </p>
          </div>
        </div>

        {campanha.valorMeta && (
          <div className="border-t border-border/60 pt-3">
            <p className="text-xs text-muted-foreground">
              Meta: <span className="text-foreground font-medium">{fmt(campanha.valorMeta)}</span>
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="border-t border-border/60 pt-3 flex flex-wrap gap-2">
            {campanha.status === 'PLANEJADA' && (
              <Button size="sm" onClick={handleIniciar} disabled={isPending}>
                <Play className="h-3.5 w-3.5" /> Iniciar
              </Button>
            )}
            {campanha.status === 'ATIVA' && (
              <Button size="sm" variant="outline" onClick={handleConcluir} disabled={isPending}>
                <CheckCheck className="h-3.5 w-3.5" /> Concluir
              </Button>
            )}
            {campanha.status === 'CONCLUIDA' && (
              <Button size="sm" variant="outline" onClick={() => setConfirmLiquidar(true)} disabled={isPending}>
                <Banknote className="h-3.5 w-3.5" /> Liquidar
              </Button>
            )}
            {(campanha.status === 'PLANEJADA' || campanha.status === 'ATIVA') && (
              <Button
                size="sm" variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmCancelar(true)}
                disabled={isPending}
              >
                <X className="h-3.5 w-3.5" /> Cancelar
              </Button>
            )}
            {(campanha.status === 'PLANEJADA' || campanha.status === 'CANCELADA') && (
              <Button
                size="sm" variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                onClick={() => setConfirmDeletar(true)}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue={campanha.tipo === 'PRODUCAO' ? 'ordens' : campanha.tipo === 'AQUISICAO' ? 'cotas' : 'contribuicoes'}>
        <TabsList className="flex-wrap">
          {campanha.tipo === 'PRODUCAO' && (
            <TabsTrigger value="ordens">Ordens</TabsTrigger>
          )}
          {campanha.tipo === 'AQUISICAO' && (
            <TabsTrigger value="cotas">Cotas</TabsTrigger>
          )}
          {campanha.tipo === 'AQUISICAO' && (
            <TabsTrigger value="itens">Itens</TabsTrigger>
          )}
          <TabsTrigger value="contribuicoes">Contribuições</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
          <TabsTrigger value="apuracao">Apuração</TabsTrigger>
        </TabsList>
        {campanha.tipo === 'PRODUCAO' && (
          <TabsContent value="ordens" className="mt-4">
            <OrdensProducaoTab campanhaId={campanha.id} statusCampanha={campanha.status} />
          </TabsContent>
        )}
        {campanha.tipo === 'AQUISICAO' && (
          <TabsContent value="cotas" className="mt-4">
            <CotasTab
              campanhaId={campanha.id}
              statusCampanha={campanha.status}
              isAdmin={isAdmin}
              valorMeta={campanha.valorMeta}
              valorMinimo={campanha.valorMinimo}
              valorMaximo={campanha.valorMaximo}
            />
          </TabsContent>
        )}
        {campanha.tipo === 'AQUISICAO' && (
          <TabsContent value="itens" className="mt-4">
            <ItensAquisicaoTab
              campanhaId={campanha.id}
              statusCampanha={campanha.status}
              isAdmin={isAdmin}
            />
          </TabsContent>
        )}
        <TabsContent value="contribuicoes" className="mt-4">
          <ContribuicoesTab campanhaId={campanha.id} statusCampanha={campanha.status} />
        </TabsContent>
        <TabsContent value="custos" className="mt-4">
          <CustosTab campanhaId={campanha.id} statusCampanha={campanha.status} />
        </TabsContent>
        <TabsContent value="apuracao" className="mt-4">
          <ApuracaoTab campanhaId={campanha.id} statusCampanha={campanha.status} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmCancelar}
        onOpenChange={setConfirmCancelar}
        title="Cancelar campanha"
        description={`Deseja cancelar "${campanha.nome}"? Esta ação não pode ser desfeita caso existam contribuições.`}
        confirmLabel="Cancelar Campanha"
        variant="destructive"
        onConfirm={handleCancelar}
        isPending={cancelando}
      />
      <ConfirmDialog
        open={confirmLiquidar}
        onOpenChange={setConfirmLiquidar}
        title="Liquidar campanha"
        description={`Liquidar "${campanha.nome}" calculará o rateio final e gerará movimentos financeiros para todos os participantes. Esta ação é irreversível (RN26).`}
        confirmLabel="Confirmar Liquidação"
        variant="destructive"
        onConfirm={handleLiquidar}
        isPending={liquidando}
      />
      <ConfirmDialog
        open={confirmDeletar}
        onOpenChange={setConfirmDeletar}
        title="Excluir campanha"
        description={`Deseja excluir permanentemente "${campanha.nome}"? Todos os dados associados (contribuições, custos, ordens) serão removidos. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        isPending={deletando}
        onConfirm={async () => {
          try {
            await deletar(campanha.id)
            toast.success('Campanha excluída.')
            router.push('/campanhas')
          } catch {
            toast.error('Erro ao excluir campanha.')
          }
        }}
      />
    </div>
  )
}
