'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared'
import {
  useColheitasPorAssociado,
  useTiposMateriaPrima,
} from '@/hooks/useProducao'
import { RegistrarColheitaDialog } from './RegistrarColheitaDialog'

interface Props {
  associadoId: string
}

function formatDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

export function ProducaoTab({ associadoId }: Props) {
  const [colheitaOpen, setColheitaOpen] = useState(false)

  const { data: colheitas = [], isLoading: loadingC } = useColheitasPorAssociado(associadoId)
  const { data: tipos = [], isLoading: loadingT } = useTiposMateriaPrima()

  const isLoading = loadingC || loadingT

  function getTipo(id: string) { return tipos.find((t) => t.id === id) }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Colheitas</CardTitle>
          <Button size="sm" onClick={() => setColheitaOpen(true)}>
            <Plus className="h-4 w-4" /> Registrar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {colheitas.length === 0 ? (
            <EmptyState title="Nenhuma colheita registrada" className="py-10" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colheitas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{getTipo(c.tipoMateriaPrimaId)?.nome ?? '—'}</TableCell>
                    <TableCell>{c.volume} {getTipo(c.tipoMateriaPrimaId)?.unidade ?? ''}</TableCell>
                    <TableCell>
                      {c.campanhaId ?? <span className="text-muted-foreground text-xs">Pool geral</span>}
                    </TableCell>
                    <TableCell>{formatDate(c.dataColheita)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.observacao ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RegistrarColheitaDialog open={colheitaOpen} onOpenChange={setColheitaOpen} associadoId={associadoId} />
    </div>
  )
}
