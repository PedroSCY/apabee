'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { UserPlus, Pencil, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAssociados, useExcluirAssociado } from '@/hooks/useAssociados'
import { DataTable, StatusBadge, ConfirmDialog, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AssociadoResponse } from '@/lib/api/identidade'
import { CadastrarAssociadoDialog } from './CadastrarAssociadoDialog'
import { AprovarAssociadoDialog } from './AprovarAssociadoDialog'

type StatusFilter = 'TODOS' | 'ATIVO' | 'PENDENTE' | 'SUSPENSO' | 'INATIVO'

type AssociadoRow = {
  id: string
  nome: string
  email: string
  status: string
  dataIngresso: string
  observacoes?: string
}

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Ativos', value: 'ATIVO' },
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Suspensos', value: 'SUSPENSO' },
  { label: 'Inativos', value: 'INATIVO' },
]

function countByStatus(rows: AssociadoRow[], status: StatusFilter): number {
  return rows.filter((r) => r.status === status).length
}

function toRow(a: AssociadoResponse): AssociadoRow {
  return {
    id: a.id,
    nome: a.usuario.nome,
    email: a.usuario.email,
    status: a.status,
    dataIngresso: a.dataIngresso
      ? format(new Date(a.dataIngresso.slice(0, 10) + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })
      : '—',
    observacoes: a.observacoes,
  }
}

export function AssociadosClient() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('TODOS')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [aprovarId, setAprovarId] = React.useState<string | null>(null)
  const [reprovarConfirm, setReprovarConfirm] = React.useState<AssociadoRow | null>(null)

  const { data, isLoading } = useAssociados()
  const { mutateAsync: excluir, isPending: excluindo } = useExcluirAssociado()

  const allRows: AssociadoRow[] = React.useMemo(() => (data ?? []).map(toRow), [data])

  const rows: AssociadoRow[] = React.useMemo(
    () => statusFilter === 'TODOS' ? allRows : allRows.filter((r) => r.status === statusFilter),
    [allRows, statusFilter],
  )

  const aprovarAssociado = aprovarId ? allRows.find((r) => r.id === aprovarId) : null

  async function handleReprovar() {
    if (!reprovarConfirm) return
    try {
      await excluir(reprovarConfirm.id)
      toast.success(`Solicitação de ${reprovarConfirm.nome} reprovada.`)
    } catch { toast.error('Erro ao reprovar associado.') }
    finally { setReprovarConfirm(null) }
  }

  const defaultColumns: Column<AssociadoRow>[] = [
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
      className: 'w-24 text-right',
      render: (row) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/associados/${row.id}`}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        </Button>
      ),
    },
  ]

  const pendenteColumns: Column<AssociadoRow>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail', className: 'text-muted-foreground' },
    {
      key: 'observacoes',
      label: 'Observações',
      render: (row) => <span className="text-muted-foreground text-sm">{row.observacoes ?? '—'}</span>,
    },
    {
      key: 'acoes',
      label: '',
      className: 'w-40 text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700"
            onClick={() => setAprovarId(row.id)}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Aprovar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={() => setReprovarConfirm(row)}>
            <XCircle className="h-3.5 w-3.5 mr-1" />Reprovar
          </Button>
        </div>
      ),
    },
  ]

  const columns = statusFilter === 'PENDENTE' ? pendenteColumns : defaultColumns

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            {STATUS_FILTERS.map((f) => {
              const count = f.value !== 'TODOS' && f.value !== 'ATIVO'
                ? countByStatus(allRows, f.value)
                : 0
              return (
                <TabsTrigger key={f.value} value={f.value}>
                  {f.label}
                  {count > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Associado
        </Button>
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

      <CadastrarAssociadoDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {aprovarAssociado && (
        <AprovarAssociadoDialog
          open={aprovarId !== null}
          associadoId={aprovarAssociado.id}
          nomeAssociado={aprovarAssociado.nome}
          onOpenChange={(v) => { if (!v) setAprovarId(null) }}
        />
      )}

      <ConfirmDialog
        open={reprovarConfirm !== null}
        onOpenChange={(o) => { if (!o) setReprovarConfirm(null) }}
        title="Reprovar solicitação"
        description={`Deseja reprovar a solicitação de "${reprovarConfirm?.nome}"? O usuário e os dados serão removidos permanentemente.`}
        confirmLabel="Reprovar"
        variant="destructive"
        onConfirm={handleReprovar}
        isPending={excluindo}
      />
    </>
  )
}
