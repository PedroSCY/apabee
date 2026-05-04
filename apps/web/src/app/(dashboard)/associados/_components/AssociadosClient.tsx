'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAssociados, useAtivarUsuario, useDesativarUsuario } from '@/hooks/useAssociados'
import { DataTable, StatusBadge, ConfirmDialog, EmptyState, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import type { AssociadoResponse } from '@/lib/api/identidade'

type StatusFilter = 'TODOS' | 'ATIVO' | 'PENDENTE' | 'SUSPENSO' | 'INATIVO'

type AssociadoRow = {
  id: string
  usuarioId: string
  nome: string
  email: string
  status: string
  dataIngresso: string
}

type ConfirmAction = {
  type: 'ativar' | 'desativar'
  usuarioId: string
  nome: string
}

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Ativos', value: 'ATIVO' },
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Suspensos', value: 'SUSPENSO' },
  { label: 'Inativos', value: 'INATIVO' },
]

function toRow(a: AssociadoResponse): AssociadoRow {
  return {
    id: a.id,
    usuarioId: a.usuario.id,
    nome: a.usuario.nome,
    email: a.usuario.email,
    status: a.status,
    dataIngresso: format(new Date(a.dataIngresso), 'dd/MM/yyyy', { locale: ptBR }),
  }
}

export function AssociadosClient() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('TODOS')
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null)

  const { data, isLoading } = useAssociados()
  const { mutateAsync: ativar, isPending: ativando } = useAtivarUsuario()
  const { mutateAsync: desativar, isPending: desativando } = useDesativarUsuario()

  const rows: AssociadoRow[] = React.useMemo(() => {
    const all = (data ?? []).map(toRow)
    return statusFilter === 'TODOS' ? all : all.filter((r) => r.status === statusFilter)
  }, [data, statusFilter])

  const columns: Column<AssociadoRow>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail', className: 'text-muted-foreground' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'dataIngresso', label: 'Ingresso' },
    {
      key: 'acoes',
      label: '',
      className: 'w-28 text-right',
      render: (row) => {
        const isAtivo = row.status === 'ATIVO'
        return isAtivo ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() =>
              setConfirmAction({ type: 'desativar', usuarioId: row.usuarioId, nome: row.nome })
            }
          >
            Desativar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfirmAction({ type: 'ativar', usuarioId: row.usuarioId, nome: row.nome })
            }
          >
            Ativar
          </Button>
        )
      },
    },
  ]

  async function handleConfirm() {
    if (!confirmAction) return
    try {
      if (confirmAction.type === 'ativar') {
        await ativar(confirmAction.usuarioId)
        toast.success(`${confirmAction.nome} ativado com sucesso.`)
      } else {
        await desativar(confirmAction.usuarioId)
        toast.success(`${confirmAction.nome} desativado.`)
      }
    } catch {
      toast.error('Ocorreu um erro. Tente novamente.')
    } finally {
      setConfirmAction(null)
    }
  }

  return (
    <>
      {/* Filtro de status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Buscar por nome ou e-mail..."
        searchKeys={['nome', 'email']}
        emptyTitle="Nenhum associado encontrado"
        emptyDescription={
          statusFilter !== 'TODOS'
            ? `Não há associados com status ${statusFilter}.`
            : 'Cadastre o primeiro associado para começar.'
        }
      />

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => { if (!open) setConfirmAction(null) }}
        title={confirmAction?.type === 'ativar' ? 'Ativar associado' : 'Desativar associado'}
        description={
          confirmAction?.type === 'ativar'
            ? `Tem certeza que deseja ativar ${confirmAction?.nome}?`
            : `Tem certeza que deseja desativar ${confirmAction?.nome}? O acesso ao sistema será bloqueado.`
        }
        confirmLabel={confirmAction?.type === 'ativar' ? 'Ativar' : 'Desativar'}
        variant={confirmAction?.type === 'desativar' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
        isPending={ativando || desativando}
      />
    </>
  )
}
