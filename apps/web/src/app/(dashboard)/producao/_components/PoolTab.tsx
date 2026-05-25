'use client'

import { toast } from 'sonner'
import { AlertCircle, Package, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useEstoquePool, useTiposMateriaPrima, useDeletarItemPool } from '@/hooks/useProducao'
import { EmptyState } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function saldoBadge(qtd: number) {
  if (qtd <= 0) return <Badge variant="destructive">Sem saldo</Badge>
  if (qtd < 5) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Baixo</Badge>
  return <Badge variant="secondary" className="text-green-700 bg-green-50">Disponível</Badge>
}

export function PoolTab() {
  const { data: pool = [], isLoading } = useEstoquePool()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutate: deletarPool, isPending: deletando } = useDeletarItemPool()

  const tipoNome = (id: string) => tipos.find((t) => t.id === id)?.nome ?? id.slice(0, 8)

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-md border bg-muted/40 px-3 py-2">
        Estoque compartilhado da associação. Alimentado por colheitas sem campanha vinculada. Colheitas vinculadas a campanhas de produção são gerenciadas no estoque dedicado de cada campanha.
      </p>
      {pool.length === 0 ? (
        <EmptyState
          title="Pool vazio"
          description="Nenhuma matéria-prima disponível no pool. Registre colheitas sem campanha para alimentar o estoque compartilhado."
          className="py-8"
          icon={AlertCircle}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Saldo</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Unidade</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pool.map((item) => (
                <TableRow key={item.tipoMateriaPrimaId}>
                  <TableCell className="font-medium px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {tipoNome(item.tipoMateriaPrimaId)}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 tabular-nums">
                    {item.quantidadeDisponivel.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground px-4 py-3">{item.unidade}</TableCell>
                  <TableCell className="px-4 py-3">{saldoBadge(item.quantidadeDisponivel)}</TableCell>
                  <TableCell className="px-2 py-2 text-right">
                    {item.quantidadeDisponivel === 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={deletando}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover item do pool?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O registro de <strong>{tipoNome(item.tipoMateriaPrimaId)}</strong> com saldo zero será removido do pool. Novas colheitas desse tipo criarão um novo registro automaticamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deletarPool(item.tipoMateriaPrimaId, {
                                onSuccess: () => toast.success('Item removido do pool.'),
                                onError: (e) => toast.error((e as { message?: string }).message ?? 'Erro ao remover item.'),
                              })}
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
