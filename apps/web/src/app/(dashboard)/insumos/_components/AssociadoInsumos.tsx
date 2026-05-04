'use client'

import * as React from 'react'
import { Tabs } from 'radix-ui'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useEquipamentos } from '@/hooks/useEquipamentos'
import { useInsumos } from '@/hooks/useInsumos'
import { useAssociados } from '@/hooks/useAssociados'
import { useAtribuicoesPorAssociado, useDevolverPatrimonio } from '@/hooks/useAtribuicoes'
import { DataTable, StatusBadge, ConfirmDialog, EmptyState, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import type { EquipamentoResponse, InsumoResponse, AtribuicaoPatrimonioResponse } from '@/lib/api/patrimonio'
import { SolicitarDialog } from './SolicitarDialog'

type PatrimonioRow = { id: string; nome: string; tipo: string; categoria?: string; status: string }
type AtribuicaoRow = AtribuicaoPatrimonioResponse & { nome: string }

const TABS = [
  { value: 'disponiveis', label: 'Disponíveis' },
  { value: 'em_uso', label: 'Em uso' },
  { value: 'comigo', label: 'Comigo' },
  { value: 'manutencao', label: 'Manutenção' },
]

interface Props { userId: string }

export function AssociadoInsumos({ userId }: Props) {
  const { data: equipamentos = [] } = useEquipamentos()
  const { data: insumos = [] } = useInsumos()
  const { data: associados = [] } = useAssociados()

  const meuAssociadoId = associados.find((a) => a.usuario.id === userId)?.id ?? ''
  const { data: atribuicoes = [] } = useAtribuicoesPorAssociado(meuAssociadoId)
  const { mutateAsync: devolver } = useDevolverPatrimonio()

  const [solicitar, setSolicitar] = React.useState<{ item: PatrimonioRow } | null>(null)
  const [devolverConfirm, setDevolverConfirm] = React.useState<{ id: string; nome: string } | null>(null)

  const ativasIds = new Set(atribuicoes.filter((a) => a.status === 'ATIVO').map((a) => a.patrimonioId))

  const allItems: PatrimonioRow[] = [
    ...equipamentos.map((e: EquipamentoResponse) => ({ id: e.id, nome: e.nome, tipo: 'EQUIPAMENTO', status: e.status })),
    ...insumos.map((i: InsumoResponse) => ({ id: i.id, nome: i.nome, tipo: 'INSUMO', categoria: i.categoria, status: i.status })),
  ]

  const LABEL_TIPO: Record<string, string> = { EQUIPAMENTO: 'Equipamento', INSUMO: 'Insumo' }
  const LABEL_CAT: Record<string, string> = { FERRAMENTA: 'Ferramenta', INSUMO: 'Insumo' }

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

  const atribuicaoCols: Column<AtribuicaoRow>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipoPatrimonio', label: 'Tipo', render: (r) => LABEL_TIPO[r.tipoPatrimonio] ?? r.tipoPatrimonio },
    { key: 'dataInicio', label: 'Desde', render: (r) => format(new Date(r.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) },
    {
      key: 'acao', label: '', className: 'w-28 text-right',
      render: (r) => (
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
          onClick={() => setDevolverConfirm({ id: r.id, nome: r.nome })}>
          Devolver
        </Button>
      ),
    },
  ]

  const minhasAtribuicoes: AtribuicaoRow[] = atribuicoes
    .filter((a) => a.status === 'ATIVO')
    .map((a) => ({
      ...a,
      nome: allItems.find((i) => i.id === a.patrimonioId)?.nome ?? a.patrimonioId,
    }))

  async function handleDevolver() {
    if (!devolverConfirm) return
    try {
      await devolver(devolverConfirm.id)
      toast.success(`${devolverConfirm.nome} devolvido.`)
    } catch { toast.error('Erro ao devolver.') }
    finally { setDevolverConfirm(null) }
  }

  return (
    <>
      <Tabs.Root defaultValue="disponiveis">
        <Tabs.List className="flex gap-1 border-b border-border mb-6">
          {TABS.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground transition-colors">
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="disponiveis">
          <DataTable data={allItems.filter((i) => i.status === 'DISPONIVEL')}
            columns={disponiveisCols} rowKey={(r) => r.id}
            searchable searchPlaceholder="Buscar..." searchKeys={['nome']}
            emptyTitle="Nenhum item disponível no momento" />
        </Tabs.Content>

        <Tabs.Content value="em_uso">
          <DataTable data={allItems.filter((i) => i.status === 'EM_USO' && !ativasIds.has(i.id))}
            columns={patrimonioCols} rowKey={(r) => r.id}
            emptyTitle="Nenhum item em uso por outros membros" />
        </Tabs.Content>

        <Tabs.Content value="comigo">
          {!meuAssociadoId ? (
            <EmptyState title="Perfil de associado não encontrado" description="Entre em contato com o administrador." />
          ) : (
            <DataTable data={minhasAtribuicoes} columns={atribuicaoCols} rowKey={(r) => r.id}
              emptyTitle="Nenhum item com você no momento" />
          )}
        </Tabs.Content>

        <Tabs.Content value="manutencao">
          <DataTable data={allItems.filter((i) => i.status === 'MANUTENCAO')}
            columns={patrimonioCols} rowKey={(r) => r.id}
            emptyTitle="Nenhum item em manutenção" />
        </Tabs.Content>
      </Tabs.Root>

      {solicitar && (
        <SolicitarDialog
          open={true}
          onOpenChange={(o) => { if (!o) setSolicitar(null) }}
          patrimonioId={solicitar.item.id}
          tipoPatrimonio={solicitar.item.tipo}
          patrimonioNome={solicitar.item.nome}
          associadoId={meuAssociadoId}
        />
      )}

      <ConfirmDialog
        open={devolverConfirm !== null}
        onOpenChange={(o) => { if (!o) setDevolverConfirm(null) }}
        title="Devolver item"
        description={`Confirma a devolução de "${devolverConfirm?.nome}"?`}
        confirmLabel="Devolver" variant="destructive"
        onConfirm={handleDevolver} />
    </>
  )
}
