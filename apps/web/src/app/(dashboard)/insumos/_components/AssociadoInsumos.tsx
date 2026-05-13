'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEquipamentos } from '@/hooks/useEquipamentos'
import { useInsumos } from '@/hooks/useInsumos'
import { useMeuPerfil } from '@/hooks/useAssociados'
import { useAtribuicoesPorAssociado } from '@/hooks/useAtribuicoes'
import { DataTable, StatusBadge, EmptyState, ViewToggle, type Column } from '@/components/shared'
import { useViewToggle } from '@/hooks/useViewToggle'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { EquipamentoResponse, InsumoResponse, AtribuicaoPatrimonioResponse } from '@/lib/api/patrimonio'
import { SolicitarDialog } from './SolicitarDialog'

type PatrimonioRow = { id: string; nome: string; tipo: string; categoria?: string; status: string }
type AtribuicaoRow = AtribuicaoPatrimonioResponse & { nome: string }

const LABEL_TIPO: Record<string, string> = { EQUIPAMENTO: 'Equipamento', INSUMO: 'Insumo' }

export function AssociadoInsumos() {
  const { data: equipamentos = [] } = useEquipamentos()
  const { data: insumos = [] } = useInsumos()
  const { data: meuPerfil, isLoading: loadingPerfil } = useMeuPerfil()

  const meuAssociadoId = meuPerfil?.id ?? ''
  const { data: atribuicoes = [] } = useAtribuicoesPorAssociado(meuAssociadoId)

  const [solicitar, setSolicitar] = React.useState<{ item: PatrimonioRow } | null>(null)
  const [dispView, setDispView] = useViewToggle('insumos-assoc')

  const allItems: PatrimonioRow[] = [
    ...equipamentos.map((e: EquipamentoResponse) => ({ id: e.id, nome: e.nome, tipo: 'EQUIPAMENTO', status: e.status })),
    ...insumos.map((i: InsumoResponse) => ({ id: i.id, nome: i.nome, tipo: 'INSUMO', categoria: i.categoria, status: i.status })),
  ]

  const minhasAtribuicoes: AtribuicaoRow[] = atribuicoes
    .filter((a) => a.status === 'ATIVO')
    .map((a) => ({
      ...a,
      nome: allItems.find((i) => i.id === a.patrimonioId)?.nome ?? a.patrimonioId,
    }))

  const minhasIds = new Set(minhasAtribuicoes.map((a) => a.patrimonioId))
  const disponiveis = allItems.filter((i) => i.status === 'DISPONIVEL')

  const patrimonioCols: Column<PatrimonioRow>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo', render: (r) => LABEL_TIPO[r.tipo] ?? r.tipo },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  const disponiveisCols: Column<PatrimonioRow>[] = [
    ...patrimonioCols,
    {
      key: 'acao', label: '', className: 'w-28 text-right',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setSolicitar({ item: r })}>
          Solicitar
        </Button>
      ),
    },
  ]

  const emUsoCols: Column<PatrimonioRow>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo', render: (r) => LABEL_TIPO[r.tipo] ?? r.tipo },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'comigo', label: '',
      render: (r) => minhasIds.has(r.id)
        ? <span className="text-xs font-medium text-primary">Comigo</span>
        : null,
    },
  ]

  const atribuicaoCols: Column<AtribuicaoRow>[] = [
    { key: 'nome', label: 'Nome' },
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

        <TabsContent value="disponiveis" className="space-y-4">
          <div className="flex items-center justify-between">
            <ViewToggle view={dispView} onViewChange={setDispView} />
            <span className="text-xs text-muted-foreground">{disponiveis.length} itens disponíveis</span>
          </div>
          {dispView === 'grid' ? (
            disponiveis.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-10">Nenhum item disponível no momento.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {disponiveis.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={r.status} />
                      <span className="text-xs text-muted-foreground">{LABEL_TIPO[r.tipo] ?? r.tipo}</span>
                    </div>
                    <p className="font-semibold text-sm">{r.nome}</p>
                    {r.categoria && (
                      <p className="text-xs text-muted-foreground -mt-1">{r.categoria}</p>
                    )}
                    <Button size="sm" className="mt-auto" onClick={() => setSolicitar({ item: r })}>
                      Solicitar
                    </Button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <DataTable
              data={disponiveis}
              columns={disponiveisCols}
              rowKey={(r) => r.id}
              searchable
              searchPlaceholder="Buscar por nome…"
              searchKeys={['nome']}
              emptyTitle="Nenhum item disponível no momento"
            />
          )}
        </TabsContent>

        <TabsContent value="em_uso">
          <DataTable
            data={allItems.filter((i) => i.status === 'EM_USO')}
            columns={emUsoCols}
            rowKey={(r) => r.id}
            searchable
            searchPlaceholder="Buscar por nome…"
            searchKeys={['nome']}
            emptyTitle="Nenhum item em uso no momento"
          />
        </TabsContent>

        <TabsContent value="comigo">
          {semPerfil ? (
            <EmptyState
              title="Perfil de associado não encontrado"
              description="Entre em contato com o administrador."
            />
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
            data={allItems.filter((i) => i.status === 'MANUTENCAO')}
            columns={patrimonioCols}
            rowKey={(r) => r.id}
            emptyTitle="Nenhum item em manutenção"
          />
        </TabsContent>
      </Tabs>

      {solicitar && (
        <SolicitarDialog
          open={true}
          onOpenChange={(o) => { if (!o) setSolicitar(null) }}
          patrimonioId={solicitar.item.id}
          tipoPatrimonio={solicitar.item.tipo}
          patrimonioNome={solicitar.item.nome}
        />
      )}
    </>
  )
}
