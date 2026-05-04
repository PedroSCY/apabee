'use client'

import * as React from 'react'
import { Tabs } from 'radix-ui'
import { Plus, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { useEquipamentos, useColocarEquipamentoEmManutencao } from '@/hooks/useEquipamentos'
import { useInsumos, useColocarInsumoEmManutencao } from '@/hooks/useInsumos'
import { DataTable, StatusBadge, ConfirmDialog, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import type { EquipamentoResponse, InsumoResponse } from '@/lib/api/patrimonio'
import { EquipamentoFormDialog } from './EquipamentoFormDialog'
import { InsumoFormDialog } from './InsumoFormDialog'

const LABEL_CATEGORIA: Record<string, string> = { FERRAMENTA: 'Ferramenta', INSUMO: 'Insumo' }

export function AdminInsumos() {
  const { data: equipamentos = [], isLoading: loadingEq } = useEquipamentos()
  const { data: insumos = [], isLoading: loadingIns } = useInsumos()
  const { mutateAsync: manutencaoEq } = useColocarEquipamentoEmManutencao()
  const { mutateAsync: manutencaoIns } = useColocarInsumoEmManutencao()

  const [eqForm, setEqForm] = React.useState<{ open: boolean; item?: EquipamentoResponse }>({ open: false })
  const [insForm, setInsForm] = React.useState<{ open: boolean; item?: InsumoResponse }>({ open: false })
  const [manutencaoConfirm, setManutencaoConfirm] = React.useState<
    { tipo: 'equipamento' | 'insumo'; id: string; nome: string } | null
  >(null)

  const eqColumns: Column<EquipamentoResponse>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'numeroSerie', label: 'N° Série', render: (r) => r.numeroSerie ?? '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'acoes', label: '', className: 'w-40 text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEqForm({ open: true, item: r })}>Editar</Button>
          {r.status !== 'MANUTENCAO' && (
            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-600"
              onClick={() => setManutencaoConfirm({ tipo: 'equipamento', id: r.id, nome: r.nome })}>
              <Wrench className="h-3.5 w-3.5 mr-1" />Manutenção
            </Button>
          )}
        </div>
      ),
    },
  ]

  const insColumns: Column<InsumoResponse>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria', render: (r) => LABEL_CATEGORIA[r.categoria] ?? r.categoria },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'acoes', label: '', className: 'w-40 text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setInsForm({ open: true, item: r })}>Editar</Button>
          {r.status !== 'MANUTENCAO' && (
            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-600"
              onClick={() => setManutencaoConfirm({ tipo: 'insumo', id: r.id, nome: r.nome })}>
              <Wrench className="h-3.5 w-3.5 mr-1" />Manutenção
            </Button>
          )}
        </div>
      ),
    },
  ]

  async function handleManutencao() {
    if (!manutencaoConfirm) return
    try {
      if (manutencaoConfirm.tipo === 'equipamento') await manutencaoEq(manutencaoConfirm.id)
      else await manutencaoIns(manutencaoConfirm.id)
      toast.success(`${manutencaoConfirm.nome} enviado para manutenção.`)
    } catch { toast.error('Erro ao atualizar status.') }
    finally { setManutencaoConfirm(null) }
  }

  return (
    <>
      <Tabs.Root defaultValue="equipamentos">
        <Tabs.List className="flex gap-1 border-b border-border mb-6">
          {['equipamentos', 'insumos'].map((tab) => (
            <Tabs.Trigger key={tab} value={tab}
              className="px-4 py-2 text-sm font-medium capitalize text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground transition-colors">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="equipamentos" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setEqForm({ open: true })}>
              <Plus className="h-4 w-4 mr-1" />Novo Equipamento
            </Button>
          </div>
          <DataTable data={equipamentos} columns={eqColumns} rowKey={(r) => r.id}
            isLoading={loadingEq} searchable searchPlaceholder="Buscar equipamento..."
            searchKeys={['nome', 'numeroSerie']} emptyTitle="Nenhum equipamento cadastrado" />
        </Tabs.Content>

        <Tabs.Content value="insumos" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setInsForm({ open: true })}>
              <Plus className="h-4 w-4 mr-1" />Novo Insumo
            </Button>
          </div>
          <DataTable data={insumos} columns={insColumns} rowKey={(r) => r.id}
            isLoading={loadingIns} searchable searchPlaceholder="Buscar insumo..."
            searchKeys={['nome']} emptyTitle="Nenhum insumo cadastrado" />
        </Tabs.Content>
      </Tabs.Root>

      <EquipamentoFormDialog open={eqForm.open} onOpenChange={(o) => setEqForm({ open: o })} equipamento={eqForm.item} />
      <InsumoFormDialog open={insForm.open} onOpenChange={(o) => setInsForm({ open: o })} insumo={insForm.item} />
      <ConfirmDialog
        open={manutencaoConfirm !== null}
        onOpenChange={(o) => { if (!o) setManutencaoConfirm(null) }}
        title="Enviar para manutenção"
        description={`Confirma que "${manutencaoConfirm?.nome}" será enviado para manutenção?`}
        confirmLabel="Confirmar" variant="default"
        onConfirm={handleManutencao} />
    </>
  )
}
