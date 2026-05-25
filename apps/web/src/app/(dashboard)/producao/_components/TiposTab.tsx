'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
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
import { useTiposMateriaPrima, useDeletarTipoMateriaPrima } from '@/hooks/useProducao'
import { EmptyState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CriarTipoMateriaPrimaDialog } from './CriarTipoMateriaPrimaDialog'

export function TiposTab() {
  const { data: tipos = [], isLoading } = useTiposMateriaPrima()
  const { mutate: deletar, isPending: deletando } = useDeletarTipoMateriaPrima()
  const [criarOpen, setCriarOpen] = React.useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCriarOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Novo Tipo
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : tipos.length === 0 ? (
        <EmptyState
          title="Nenhum tipo cadastrado"
          description="Cadastre os tipos de matéria-prima que os associados podem colher (mel, cera, própolis…)."
          className="py-8"
          action={
            <Button size="sm" onClick={() => setCriarOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Cadastrar primeiro tipo
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Nome</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Unidade</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Descrição</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium px-4 py-3">{t.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground px-4 py-3">{t.unidade}</TableCell>
                  <TableCell className="text-sm text-muted-foreground px-4 py-3">{t.descricao ?? '—'}</TableCell>
                  <TableCell className="px-2 py-2 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={deletando}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover tipo de matéria-prima?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O tipo <strong>{t.nome}</strong> e todos os dados vinculados (colheitas, estoque e movimentações) serão removidos permanentemente. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deletar(t.id, {
                              onSuccess: () => toast.success('Tipo removido.'),
                              onError: (e) => toast.error((e as { message?: string }).message ?? 'Erro ao remover tipo.'),
                            })}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CriarTipoMateriaPrimaDialog open={criarOpen} onOpenChange={setCriarOpen} />
    </div>
  )
}
