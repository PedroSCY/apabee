'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Play, CheckCheck, X, Banknote, Trash2, Download, FileText, Sheet } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog, EmptyState, PageHeader } from '@/components/shared'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { financeiroApi } from '@/lib/api/financeiro'
import {
  useCampanha,
  useIniciarCampanha,
  useConcluirCampanha,
  useCancelarCampanha,
  useLiquidarCampanha,
  useDeletarCampanha,
  useMetasProducao,
  useContribuicoes,
  useOrdensProducao,
} from '@/hooks/useCampanhas'
import { useSafras } from '@/hooks/useSafras'
import type { StatusCampanha, TipoCampanha } from '@/lib/api/campanhas'
import { ContribuicoesTab } from '../../_components/ContribuicoesTab'
import { CustosTab } from '../../_components/CustosTab'
import { OrdensProducaoTab } from './OrdensProducaoTab'
import { CotasTab } from './CotasTab'
import { ItensAquisicaoTab } from './ItensAquisicaoTab'
import { PedidosTab } from './PedidosTab'
import { ApuracaoTab } from './ApuracaoTab'
import { PlanejamentoTab } from './PlanejamentoTab'

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
  const { data: safras = [] } = useSafras()
  const isProducao = campanha?.tipo === 'PRODUCAO'
  const isAtiva = campanha?.status === 'ATIVA' || campanha?.status === 'CONCLUIDA'
  const isAtivaOnly = campanha?.status === 'ATIVA'
  const { data: metas = [] } = useMetasProducao(isProducao && isAtiva ? campanhaId : '')
  const { data: contribuicoes = [] } = useContribuicoes(isProducao && isAtivaOnly ? campanhaId : '')
  const { data: ordensPage = [] } = useOrdensProducao(isProducao && isAtivaOnly ? campanhaId : '')
  const [confirmCancelar, setConfirmCancelar] = React.useState(false)
  const [confirmLiquidar, setConfirmLiquidar] = React.useState(false)
  const [confirmDeletar, setConfirmDeletar] = React.useState(false)

  const { mutateAsync: iniciar, isPending: iniciando } = useIniciarCampanha()
  const { mutateAsync: concluir, isPending: concluindo } = useConcluirCampanha()
  const { mutateAsync: cancelar, isPending: cancelando } = useCancelarCampanha()
  const { mutateAsync: liquidar, isPending: liquidando } = useLiquidarCampanha()
  const { mutateAsync: deletar, isPending: deletando } = useDeletarCampanha()

  const isPending = iniciando || concluindo || cancelando || liquidando || deletando
  const [exportando, setExportando] = React.useState(false)

  // useMemo ANTES dos early returns — hooks não podem ficar após retornos condicionais
  const coletaProgresso = React.useMemo(() => {
    const map = new Map<string, { nome: string; unidade: string; coletado: number; necessario: number }>()
    for (const meta of metas) {
      for (const m of meta.materiaisNecessarios) {
        const atual = map.get(m.tipoMateriaPrimaId)
        if (atual) { atual.necessario += m.quantidadeNecessaria }
        else map.set(m.tipoMateriaPrimaId, { nome: m.nomeTipo, unidade: m.unidade, coletado: 0, necessario: m.quantidadeNecessaria })
      }
    }
    for (const c of contribuicoes) {
      if (c.tipo === 'COLHEITA' && c.tipoMateriaPrimaId && c.volume) {
        const entry = map.get(c.tipoMateriaPrimaId)
        if (entry) entry.coletado += c.volume
      }
    }
    return Array.from(map.values())
  }, [metas, contribuicoes])

  const producaoProgresso = React.useMemo(() => {
    const map = new Map<string, { nome: string; planejado: number; produzido: number }>()
    for (const meta of metas) {
      map.set(meta.produtoId, { nome: meta.nomeProduto, planejado: meta.quantidadePlanejada, produzido: 0 })
    }
    for (const o of ordensPage) {
      if (o.status === 'CONCLUIDA' && o.quantidadeReal) {
        const entry = map.get(o.produtoId)
        if (entry) entry.produzido += o.quantidadeReal
      }
    }
    return Array.from(map.values())
  }, [metas, ordensPage])

  async function exportarRelatorio(formato: 'pdf' | 'csv') {
    setExportando(true)
    try {
      await financeiroApi.exportarRelatorioCampanha(campanha!.id, formato)
    } catch {
      toast.error('Erro ao exportar relatório.')
    } finally {
      setExportando(false)
    }
  }

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
        <Link
          href="/campanhas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-3.5" /> Voltar às Campanhas
        </Link>
        <EmptyState
          title="Campanha não encontrada"
          description="Esta campanha não existe ou foi removida."
        />
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[campanha.status]
  const tipoCfg = TIPO_CONFIG[campanha.tipo]
  const resultado = campanha.receitaTotal - campanha.custoTotal
  const safraNome = campanha.safraId ? (safras.find(s => s.id === campanha.safraId)?.nome ?? campanha.safraId.slice(0, 8)) : null

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
              {safraNome && (
                <span className="text-xs text-muted-foreground">Safra: <span className="text-foreground font-medium">{safraNome}</span></span>
              )}
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

        {isProducao && isAtivaOnly && (coletaProgresso.length > 0 || producaoProgresso.length > 0) && (
          <div className="border-t border-border/60 pt-3 space-y-4">
            {coletaProgresso.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Coleta de Matéria-Prima</p>
                {coletaProgresso.map(mp => {
                  const pct = mp.necessario > 0 ? Math.min(100, (mp.coletado / mp.necessario) * 100) : 0
                  const fmtQty = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
                  const cor = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                  return (
                    <div key={mp.nome} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{mp.nome}</span>
                        <span className="text-xs tabular-nums font-medium">
                          {fmtQty(mp.coletado)} / {fmtQty(mp.necessario)} {mp.unidade}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className={`${cor} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {producaoProgresso.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Produção</p>
                {producaoProgresso.map(p => {
                  const pct = p.planejado > 0 ? Math.min(100, (p.produzido / p.planejado) * 100) : 0
                  const cor = pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-400' : 'bg-muted-foreground/20'
                  return (
                    <div key={p.nome} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{p.nome}</span>
                        <span className="text-xs tabular-nums font-medium">
                          {p.produzido} / {p.planejado} un
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className={`${cor} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="border-t border-border/60 pt-3 flex flex-wrap gap-2">
            {campanha.status === 'PLANEJADA' && (
              <Button size="sm" onClick={handleIniciar} disabled={isPending}>
                <Play className="h-3.5 w-3.5" /> {iniciando ? 'Iniciando…' : 'Iniciar'}
              </Button>
            )}
            {campanha.status === 'ATIVA' && (
              <Button size="sm" variant="outline" onClick={handleConcluir} disabled={isPending}>
                <CheckCheck className="h-3.5 w-3.5" /> {concluindo ? 'Concluindo…' : 'Concluir'}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={exportando} className="ml-auto">
                  <Download className="h-3.5 w-3.5" />
                  {exportando ? 'Exportando…' : 'Relatório'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => void exportarRelatorio('pdf')}>
                  <FileText className="h-3.5 w-3.5 mr-2" /> Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void exportarRelatorio('csv')}>
                  <Sheet className="h-3.5 w-3.5 mr-2" /> Exportar CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Tabs
        key={campanha.status}
        defaultValue={
          campanha.tipo === 'PRODUCAO' && campanha.status === 'PLANEJADA'
            ? 'planejamento'
            : campanha.tipo === 'PRODUCAO'
              ? 'ordens'
              : campanha.tipo === 'AQUISICAO'
                ? 'cotas'
                : 'contribuicoes'
        }
      >
        <TabsList className="flex-wrap">
          {campanha.tipo === 'PRODUCAO' && campanha.status === 'PLANEJADA' && (
            <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
          )}
          {campanha.tipo === 'PRODUCAO' && campanha.status !== 'PLANEJADA' && (
            <TabsTrigger value="ordens">Ordens</TabsTrigger>
          )}
          {campanha.tipo === 'AQUISICAO' && (
            <TabsTrigger value="cotas">Cotas</TabsTrigger>
          )}
          {campanha.tipo === 'AQUISICAO' && (
            <TabsTrigger value="itens">Itens</TabsTrigger>
          )}
          {campanha.tipo === 'AQUISICAO' && campanha.destinatario === 'INDIVIDUAL' && (
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          )}
          {campanha.status !== 'PLANEJADA' && (
            <TabsTrigger value="contribuicoes">Contribuições</TabsTrigger>
          )}
          <TabsTrigger value="custos">Custos</TabsTrigger>
          <TabsTrigger value="apuracao">Apuração</TabsTrigger>
        </TabsList>
        {campanha.tipo === 'PRODUCAO' && campanha.status === 'PLANEJADA' && (
          <TabsContent value="planejamento" className="mt-4">
            <PlanejamentoTab campanhaId={campanha.id} />
          </TabsContent>
        )}
        {campanha.tipo === 'PRODUCAO' && campanha.status !== 'PLANEJADA' && (
          <TabsContent value="ordens" className="mt-4">
            <OrdensProducaoTab
              campanhaId={campanha.id}
              statusCampanha={campanha.status}
              onConcluir={() => void handleConcluir()}
            />
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
              destinatario={campanha.destinatario}
            />
          </TabsContent>
        )}
        {campanha.tipo === 'AQUISICAO' && campanha.destinatario === 'INDIVIDUAL' && (
          <TabsContent value="pedidos" className="mt-4">
            <PedidosTab
              campanhaId={campanha.id}
              statusCampanha={campanha.status}
              isAdmin={isAdmin}
              destinatario={campanha.destinatario}
            />
          </TabsContent>
        )}
        {campanha.status !== 'PLANEJADA' && (
          <TabsContent value="contribuicoes" className="mt-4">
            <ContribuicoesTab campanhaId={campanha.id} statusCampanha={campanha.status} tipoCampanha={campanha.tipo} />
          </TabsContent>
        )}
        <TabsContent value="custos" className="mt-4">
          <CustosTab campanhaId={campanha.id} statusCampanha={campanha.status} />
        </TabsContent>
        <TabsContent value="apuracao" className="mt-4">
          <ApuracaoTab campanhaId={campanha.id} statusCampanha={campanha.status} campanha={campanha} />
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
