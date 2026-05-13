'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog, EmptyState, StatusBadge } from '@/components/shared'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAtribuicoesPorAssociado, useDevolverPatrimonio } from '@/hooks/useAtribuicoes'
import { useEquipamentos } from '@/hooks/useEquipamentos'
import { useInsumos } from '@/hooks/useInsumos'
import type { AtribuicaoPatrimonioResponse } from '@/lib/api/patrimonio'
import { AtribuirPatrimonioDialog } from './AtribuirPatrimonioDialog'

interface Props {
  associadoId: string
}

type AtribuicaoEnriquecida = AtribuicaoPatrimonioResponse & { nome: string }

function formatDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

export function PatrimonioTab({ associadoId }: Props) {
  const [atribuirOpen, setAtribuirOpen] = useState(false)
  const [devolverTarget, setDevolverTarget] = useState<AtribuicaoEnriquecida | null>(null)

  const { data: atribuicoes = [], isLoading: loadingAtrib } = useAtribuicoesPorAssociado(associadoId)
  const { data: equipamentos = [], isLoading: loadingEq } = useEquipamentos()
  const { data: insumos = [], isLoading: loadingIn } = useInsumos()
  const { mutateAsync: devolver, isPending: devolvendo } = useDevolverPatrimonio()

  const isLoading = loadingAtrib || loadingEq || loadingIn

  const enriched: AtribuicaoEnriquecida[] = atribuicoes.map((a) => {
    const lista = a.tipoPatrimonio === 'EQUIPAMENTO' ? equipamentos : insumos
    const item = lista.find((i) => i.id === a.patrimonioId)
    return { ...a, nome: item?.nome ?? '—' }
  })

  const ativas = enriched.filter((a) => a.status === 'ATIVO')
  const historico = enriched.filter((a) => a.status !== 'ATIVO')

  async function handleDevolver() {
    if (!devolverTarget) return
    try {
      await devolver(devolverTarget.id)
      toast.success(`"${devolverTarget.nome}" devolvido com sucesso.`)
    } catch {
      toast.error('Erro ao registrar devolução.')
    } finally {
      setDevolverTarget(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Em Uso</CardTitle>
          <Button size="sm" onClick={() => setAtribuirOpen(true)}>
            <Plus className="h-4 w-4" /> Atribuir
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {ativas.length === 0 ? (
            <EmptyState
              title="Nenhum patrimônio em uso"
              description="Use o botão acima para atribuir um equipamento ou insumo."
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {ativas.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {a.tipoPatrimonio === 'EQUIPAMENTO' ? 'Equipamento' : 'Insumo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(a.dataInicio)}</TableCell>
                    <TableCell className="text-muted-foreground">{a.observacao ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDevolverTarget(a)}
                      >
                        Devolver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {historico.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">Histórico</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Devolução</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((a) => (
                  <TableRow key={a.id} className="text-muted-foreground">
                    <TableCell className="font-medium text-foreground">{a.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {a.tipoPatrimonio === 'EQUIPAMENTO' ? 'Equipamento' : 'Insumo'}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell>{formatDate(a.dataInicio)}</TableCell>
                    <TableCell>{a.dataFim ? formatDate(a.dataFim) : '—'}</TableCell>
                    <TableCell>{a.observacao ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AtribuirPatrimonioDialog
        open={atribuirOpen}
        onOpenChange={setAtribuirOpen}
        associadoId={associadoId}
      />

      <ConfirmDialog
        open={devolverTarget !== null}
        onOpenChange={(open) => { if (!open) setDevolverTarget(null) }}
        title="Confirmar devolução"
        description={`Registrar devolução de "${devolverTarget?.nome}"?`}
        confirmLabel="Devolver"
        variant="default"
        onConfirm={handleDevolver}
        isPending={devolvendo}
      />
    </div>
  )
}
