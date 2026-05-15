'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEquipamentos } from '@/hooks/useEquipamentos'
import { useTiposInsumo, useInsumos } from '@/hooks/useInsumos'
import { useMeuPerfil } from '@/hooks/useAssociados'
import { useAtribuicoesPorAssociado } from '@/hooks/useAtribuicoes'
import { DataTable, StatusBadge, EmptyState, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { EquipamentoResponse, InsumoResponse, AtribuicaoPatrimonioResponse } from '@/lib/api/patrimonio'
import { SolicitarDialog } from './SolicitarDialog'

type SolicitarState =
  | { tipoPatrimonio: 'EQUIPAMENTO'; patrimonioId: string; patrimonioNome: string }
  | { tipoPatrimonio: 'INSUMO'; tipoInsumoId: string; tipoInsumoNome: string; unidadesDisponiveis: number }

type UnidadeRow = { id: string; nome: string; subtitulo?: string; tipo: string; status: string }
type AtribuicaoRow = AtribuicaoPatrimonioResponse & { nome: string }

const LABEL_TIPO: Record<string, string> = { EQUIPAMENTO: 'Equipamento', INSUMO: 'Insumo' }

export function AssociadoInsumos() {
  const { data: equipamentos = [] } = useEquipamentos()
  const { data: tiposInsumo = [] } = useTiposInsumo()
  const { data: insumos = [] } = useInsumos()
  const { data: meuPerfil, isLoading: loadingPerfil } = useMeuPerfil()

  const meuAssociadoId = meuPerfil?.id ?? ''
  const { data: atribuicoes = [] } = useAtribuicoesPorAssociado(meuAssociadoId)

  const [solicitar, setSolicitar] = React.useState<SolicitarState | null>(null)

  const disponiveisPorTipo = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const ins of insumos) {
      if (ins.status === 'DISPONIVEL') map[ins.tipoInsumoId] = (map[ins.tipoInsumoId] ?? 0) + 1
    }
    return map
  }, [insumos])

  const tiposComUnidades = tiposInsumo.filter((t) => (disponiveisPorTipo[t.id] ?? 0) > 0)
  const eqDisponiveis = equipamentos.filter((e) => e.status === 'DISPONIVEL')

  const allUnits: UnidadeRow[] = [
    ...equipamentos.map((e: EquipamentoResponse) => ({
      id: e.id, nome: e.nome, subtitulo: e.numeroSerie, tipo: 'EQUIPAMENTO', status: e.status,
    })),
    ...insumos.map((i: InsumoResponse) => ({
      id: i.id, nome: i.identificador, subtitulo: i.tipoInsumo.nome, tipo: 'INSUMO', status: i.status,
    })),
  ]

  const minhasAtribuicoes: AtribuicaoRow[] = atribuicoes
    .filter((a) => a.status === 'ATIVO')
    .map((a) => ({
      ...a,
      nome: allUnits.find((u) => u.id === a.patrimonioId)?.nome ?? a.patrimonioId,
    }))

  const unidadesCols: Column<UnidadeRow>[] = [
    {
      key: 'nome', label: 'Item',
      render: (r) => (
        <div>
          <p className="font-medium text-sm">{r.nome}</p>
          {r.subtitulo && <p className="text-xs text-muted-foreground">{r.subtitulo}</p>}
        </div>
      ),
    },
    { key: 'tipo', label: 'Tipo', render: (r) => LABEL_TIPO[r.tipo] ?? r.tipo },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  const atribuicaoCols: Column<AtribuicaoRow>[] = [
    { key: 'nome', label: 'Item' },
    { key: 'tipoPatrimonio', label: 'Tipo', render: (r) => LABEL_TIPO[r.tipoPatrimonio] ?? r.tipoPatrimonio },
    {
      key: 'dataInicio', label: 'Em uso desde',
      render: (r) => format(new Date(r.dataInicio), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'dataFim', label: 'Devolução prevista',
      render: (r) => r.dataFim
        ? format(new Date(r.dataFim), 'dd/MM/yyyy', { locale: ptBR })
        : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'observacao', label: 'Observação',
      render: (r) => r.observacao
        ? <span className="text-sm text-muted-foreground">{r.observacao}</span>
        : <span className="text-muted-foreground">—</span>,
    },
  ]

  const semPerfil = !loadingPerfil && !meuPerfil

  return (
    <>
      <Tabs defaultValue="disponiveis">
        <TabsList className="mb-6">
          <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
          <TabsTrigger value="em_uso">Em uso</TabsTrigger>
          <TabsTrigger value="comigo">
            Comigo
            {minhasAtribuicoes.length > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {minhasAtribuicoes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="disponiveis" className="space-y-6">
          {eqDisponiveis.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Equipamentos</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {eqDisponiveis.map((e) => (
                  <div key={e.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted-foreground">Equipamento</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{e.nome}</p>
                      {e.numeroSerie && <p className="text-xs text-muted-foreground mt-0.5">Série: {e.numeroSerie}</p>}
                    </div>
                    <Button size="sm" className="mt-auto"
                      onClick={() => setSolicitar({ tipoPatrimonio: 'EQUIPAMENTO', patrimonioId: e.id, patrimonioNome: e.nome })}>
                      Solicitar
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tiposComUnidades.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Insumos</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tiposComUnidades.map((t) => {
                  const disponiveis = disponiveisPorTipo[t.id] ?? 0
                  return (
                    <div key={t.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t.categoria === 'FERRAMENTA' ? 'Ferramenta' : 'Insumo'}</span>
                        <span className="font-mono text-xs text-muted-foreground">{t.sigla}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.nome}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{disponiveis} unidade(s) disponível(is)</p>
                      </div>
                      <Button size="sm" className="mt-auto"
                        onClick={() => setSolicitar({ tipoPatrimonio: 'INSUMO', tipoInsumoId: t.id, tipoInsumoNome: t.nome, unidadesDisponiveis: disponiveis })}>
                        Solicitar
                      </Button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {eqDisponiveis.length === 0 && tiposComUnidades.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-10">Nenhum item disponível no momento.</p>
          )}
        </TabsContent>

        <TabsContent value="em_uso">
          <DataTable
            data={allUnits.filter((u) => u.status === 'EM_USO')}
            columns={unidadesCols}
            rowKey={(r) => r.id}
            searchable searchPlaceholder="Buscar por nome…" searchKeys={['nome']}
            emptyTitle="Nenhum item em uso no momento"
          />
        </TabsContent>

        <TabsContent value="comigo">
          {semPerfil ? (
            <EmptyState title="Perfil de associado não encontrado" description="Entre em contato com o administrador." />
          ) : (
            <DataTable
              data={minhasAtribuicoes}
              columns={atribuicaoCols}
              rowKey={(r) => r.id}
              emptyTitle="Nenhum item com você no momento"
            />
          )}
        </TabsContent>

        <TabsContent value="manutencao">
          <DataTable
            data={allUnits.filter((u) => u.status === 'MANUTENCAO')}
            columns={unidadesCols}
            rowKey={(r) => r.id}
            emptyTitle="Nenhum item em manutenção"
          />
        </TabsContent>
      </Tabs>

      {solicitar && solicitar.tipoPatrimonio === 'EQUIPAMENTO' ? (
        <SolicitarDialog
          open={true}
          onOpenChange={(o) => { if (!o) setSolicitar(null) }}
          tipoPatrimonio="EQUIPAMENTO"
          patrimonioId={solicitar.patrimonioId}
          patrimonioNome={solicitar.patrimonioNome}
        />
      ) : solicitar && solicitar.tipoPatrimonio === 'INSUMO' ? (
        <SolicitarDialog
          open={true}
          onOpenChange={(o) => { if (!o) setSolicitar(null) }}
          tipoPatrimonio="INSUMO"
          tipoInsumoId={solicitar.tipoInsumoId}
          tipoInsumoNome={solicitar.tipoInsumoNome}
          unidadesDisponiveis={solicitar.unidadesDisponiveis}
        />
      ) : null}
    </>
  )
}
