'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Ban, CheckCircle, RotateCcw, Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared'
import {
  useAssociado,
  useMarcarIsentoAssociado,
  useRemoverIsencaoAssociado,
} from '@/hooks/useAssociados'
import {
  useMarcarIsentoMensalidade,
  useMensalidadesPorAssociado,
  useQuitarMensalidade,
  useReativarMensalidade,
} from '@/hooks/useFinanceiro'

interface Props {
  associadoId: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400' },
  PAGO:     { label: 'Pago',     className: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
  ISENTO:   { label: 'Isento',   className: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400' },
}

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function MensalidadesAssociadoSection({ associadoId }: Props) {
  const { data: associado } = useAssociado(associadoId)
  const { data: mensalidades = [], isLoading } = useMensalidadesPorAssociado(associadoId)

  const { mutateAsync: marcarIsento, isPending: marcando } = useMarcarIsentoAssociado()
  const { mutateAsync: removerIsencao, isPending: removendo } = useRemoverIsencaoAssociado()
  const { mutateAsync: quitar, isPending: quitando } = useQuitarMensalidade()
  const { mutateAsync: isentar, isPending: isentando } = useMarcarIsentoMensalidade()
  const { mutateAsync: reativar, isPending: reativando } = useReativarMensalidade()

  const [quitarId, setQuitarId] = React.useState<string | null>(null)
  const [metodo, setMetodo] = React.useState<'PRESENCIAL' | 'TRANSFERENCIA'>('PRESENCIAL')
  const [isentarId, setIsentarId] = React.useState<string | null>(null)
  const [motivo, setMotivo] = React.useState('')

  const isentoEstruturalAtual = associado?.isentoMensalidade ?? false

  async function handleToggleIsencaoEstrutural() {
    try {
      if (isentoEstruturalAtual) {
        await removerIsencao(associadoId)
        toast.success('Isenção estrutural removida.')
      } else {
        await marcarIsento(associadoId)
        toast.success('Associado marcado como isento estruturalmente.')
      }
    } catch {
      toast.error('Erro ao alterar isenção.')
    }
  }

  async function handleQuitar() {
    if (!quitarId) return
    try {
      await quitar({ id: quitarId, input: { metodoPagamento: metodo } })
      toast.success('Mensalidade quitada.')
      setQuitarId(null)
    } catch {
      toast.error('Erro ao quitar mensalidade.')
    }
  }

  async function handleIsentar() {
    if (!isentarId) return
    try {
      await isentar({ id: isentarId, input: { motivo: motivo || undefined } })
      toast.success('Mensalidade marcada como isenta.')
      setIsentarId(null)
      setMotivo('')
    } catch {
      toast.error('Erro ao isentar mensalidade.')
    }
  }

  async function handleReativar(id: string) {
    try {
      await reativar(id)
      toast.success('Mensalidade reativada para PENDENTE.')
    } catch {
      toast.error('Erro ao reativar mensalidade.')
    }
  }

  const pendentesCount = mensalidades.filter((m) => m.status === 'PENDENTE').length

  return (
    <>
      {/* Isenção estrutural */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium">Isenção Estrutural de Mensalidade</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isentoEstruturalAtual
                ? 'Este associado não receberá mensalidades nas próximas gerações em lote.'
                : 'Ao marcar, o associado será ignorado nas gerações em lote de mensalidades.'}
            </p>
          </div>
          <Button
            size="sm"
            variant={isentoEstruturalAtual ? 'destructive' : 'outline'}
            onClick={() => void handleToggleIsencaoEstrutural()}
            disabled={marcando || removendo || !associado}
          >
            {isentoEstruturalAtual ? (
              <><ShieldOff className="h-4 w-4 mr-1.5" />Remover Isenção</>
            ) : (
              <><Shield className="h-4 w-4 mr-1.5" />Marcar Isento</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de mensalidades */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Mensalidades</CardTitle>
            {pendentesCount > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400">
                {pendentesCount} pendente{pendentesCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : mensalidades.length === 0 ? (
            <EmptyState
              title="Nenhuma mensalidade"
              description="As mensalidades são geradas pelo administrador."
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensalidades
                  .slice()
                  .sort((a, b) => b.competenciaAno - a.competenciaAno || b.competenciaMes - a.competenciaMes)
                  .map((m) => {
                    const statusCfg = STATUS_CONFIG[m.status] ?? { label: m.status, className: '' }
                    const competencia = `${MESES_ABREV[m.competenciaMes - 1]}/${m.competenciaAno}`
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{competencia}</TableCell>
                        <TableCell className="tabular-nums">{fmt(m.valor)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusCfg.className}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.dataPagamento
                            ? format(parseISO(m.dataPagamento), 'dd/MM/yyyy', { locale: ptBR })
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {m.status === 'PENDENTE' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => { setQuitarId(m.id); setMetodo('PRESENCIAL') }}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Quitar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-muted-foreground"
                                  onClick={() => { setIsentarId(m.id); setMotivo('') }}
                                >
                                  <Ban className="h-3.5 w-3.5 mr-1" />
                                  Isentar
                                </Button>
                              </>
                            )}
                            {m.status === 'ISENTO' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => void handleReativar(m.id)}
                                disabled={reativando}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Reativar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!quitarId} onOpenChange={(o) => { if (!o) setQuitarId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Quitar Mensalidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Método de pagamento</Label>
            <Select value={metodo} onValueChange={(v) => setMetodo(v as typeof metodo)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setQuitarId(null)}>Cancelar</Button>
            <Button onClick={() => void handleQuitar()} disabled={quitando}>
              {quitando ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!isentarId} onOpenChange={(o) => { if (!o) setIsentarId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Isentar Mensalidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="motivo-assoc">Motivo (opcional)</Label>
            <Textarea
              id="motivo-assoc"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Dificuldade financeira temporária"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsentarId(null)}>Cancelar</Button>
            <Button onClick={() => void handleIsentar()} disabled={isentando}>
              {isentando ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
