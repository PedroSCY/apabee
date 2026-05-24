'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Ban, CheckCircle, Copy, ExternalLink, QrCode, RotateCcw, Sparkles, Trash2, Undo2, XCircle } from 'lucide-react'
import QRCode from 'react-qr-code'
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
import { useAssociados } from '@/hooks/useAssociados'
import {
  useCancelarCobranca,
  useEmitirCobranca,
  useEstornarMensalidade,
  useExcluirMensalidade,
  useGerarMensalidades,
  useMarcarIsentoMensalidade,
  useMensalidades,
  useQuitarMensalidade,
  useReativarMensalidade,
} from '@/hooks/useFinanceiro'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const now = new Date()
const ANOS = Array.from({ length: 3 }, (_, i) => now.getFullYear() - 1 + i)

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400' },
  PAGO:     { label: 'Pago',     className: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
  ISENTO:   { label: 'Isento',   className: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400' },
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function metodoPagamentoLabel(m?: string) {
  if (m === 'PRESENCIAL') return 'Presencial'
  if (m === 'TRANSFERENCIA') return 'Transferência'
  if (m === 'ONLINE') return 'PIX Online'
  return '—'
}

export function MensalidadesSection() {
  const [ano, setAno] = React.useState(now.getFullYear())
  const [mes, setMes] = React.useState(now.getMonth() + 1)

  const { data: mensalidades = [], isLoading } = useMensalidades({ ano, mes })
  const { data: associados = [] } = useAssociados()

  const { mutateAsync: gerar, isPending: gerando } = useGerarMensalidades()
  const { mutateAsync: quitar, isPending: quitando } = useQuitarMensalidade()
  const { mutateAsync: isentar, isPending: isentando } = useMarcarIsentoMensalidade()
  const { mutateAsync: reativar, isPending: reativando } = useReativarMensalidade()
  const { mutateAsync: emitirCobranca, isPending: emitindo } = useEmitirCobranca()
  const { mutateAsync: cancelarCobranca, isPending: cancelando } = useCancelarCobranca()
  const { mutateAsync: estornar, isPending: estornando } = useEstornarMensalidade()
  const { mutateAsync: excluir, isPending: excluindo } = useExcluirMensalidade()

  const nomeMap = React.useMemo(
    () => Object.fromEntries(associados.map((a) => [a.id, a.usuario.nome])),
    [associados],
  )

  const [quitarId, setQuitarId] = React.useState<string | null>(null)
  const [metodo, setMetodo] = React.useState<'PRESENCIAL' | 'TRANSFERENCIA'>('PRESENCIAL')

  const [isentarId, setIsentarId] = React.useState<string | null>(null)
  const [motivo, setMotivo] = React.useState('')

  const [cancelarId, setCancelarId] = React.useState<string | null>(null)
  const [estornarId, setEstornarId] = React.useState<string | null>(null)
  const [excluirId, setExcluirId] = React.useState<string | null>(null)

  const [pixDialog, setPixDialog] = React.useState<{
    link: string
    pixCopiaECola?: string
    pixQrCodeBase64?: string
    valor?: number
    valorCobrado?: number
    competencia?: string
    nomeAssociado?: string
  } | null>(null)

  function erroMsg(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback
  }

  async function handleGerar() {
    try {
      const geradas = await gerar({ competenciaAno: ano, competenciaMes: mes })
      toast.success(`${geradas.length} mensalidade(s) gerada(s).`)
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao gerar mensalidades.'))
    }
  }

  async function handleQuitar() {
    if (!quitarId) return
    try {
      await quitar({ id: quitarId, input: { metodoPagamento: metodo } })
      toast.success('Mensalidade quitada.')
      setQuitarId(null)
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao quitar mensalidade.'))
    }
  }

  async function handleIsentar() {
    if (!isentarId) return
    try {
      await isentar({ id: isentarId, input: { motivo: motivo || undefined } })
      toast.success('Mensalidade marcada como isenta.')
      setIsentarId(null)
      setMotivo('')
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao isentar mensalidade.'))
    }
  }

  async function handleReativar(id: string) {
    try {
      await reativar(id)
      toast.success('Mensalidade reativada para PENDENTE.')
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao reativar mensalidade.'))
    }
  }

  async function handleEmitirCobranca(id: string, m: { associadoId: string; valor: number; competenciaAno: number; competenciaMes: number }) {
    try {
      const resultado = await emitirCobranca(id)
      setPixDialog({
        link: resultado.linkPagamento,
        pixCopiaECola: resultado.pixCopiaECola,
        pixQrCodeBase64: resultado.pixQrCodeBase64,
        valor: m.valor,
        valorCobrado: resultado.valorCobrado,
        competencia: `${MESES[m.competenciaMes - 1]}/${m.competenciaAno}`,
        nomeAssociado: nomeMap[m.associadoId],
      })
      toast.success('Cobrança PIX emitida com sucesso.')
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao emitir cobrança.'))
    }
  }

  async function handleCancelarCobranca() {
    if (!cancelarId) return
    try {
      await cancelarCobranca(cancelarId)
      toast.success('Cobrança cancelada.')
      setCancelarId(null)
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao cancelar cobrança.'))
    }
  }

  async function handleEstornar() {
    if (!estornarId) return
    try {
      await estornar(estornarId)
      toast.success('Mensalidade estornada para PENDENTE.')
      setEstornarId(null)
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao estornar mensalidade.'))
    }
  }

  async function handleExcluir() {
    if (!excluirId) return
    try {
      await excluir(excluirId)
      toast.success('Mensalidade excluída. Clique em "Gerar" para recriar.')
      setExcluirId(null)
    } catch (err) {
      toast.error(erroMsg(err, 'Erro ao excluir mensalidade.'))
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium">Mensalidades</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((nome, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANOS.map((a) => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => void handleGerar()} disabled={gerando}>
                <Sparkles className="h-4 w-4 mr-1.5" />
                {gerando ? 'Gerando...' : 'Gerar'}
              </Button>
            </div>
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
              description={`Nenhuma mensalidade gerada para ${MESES[mes - 1]}/${ano}. Clique em "Gerar" para criar.`}
              className="py-8"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Associado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensalidades.map((m) => {
                  const statusCfg = STATUS_CONFIG[m.status] ?? { label: m.status, className: '' }
                  const temCobranca = Boolean(m.cobrancaGatewayId)
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {nomeMap[m.associadoId] ?? m.associadoId.slice(0, 8)}
                      </TableCell>
                      <TableCell className="tabular-nums">{fmt(m.valor)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={statusCfg.className}>
                            {statusCfg.label}
                          </Badge>
                          {m.cobrancaLink && (
                            <a
                              href={m.cobrancaLink}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir link de pagamento PIX"
                              className="text-primary hover:text-primary/80"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {metodoPagamentoLabel(m.metodoPagamento)}
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
                              {!temCobranca ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => void handleEmitirCobranca(m.id, m)}
                                    disabled={emitindo}
                                  >
                                    <QrCode className="h-3.5 w-3.5 mr-1" />
                                    PIX
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-red-500 hover:text-red-600"
                                    onClick={() => setExcluirId(m.id)}
                                    title="Excluir mensalidade (permite regerar)"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Excluir
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => setPixDialog({
                                      link: m.cobrancaLink ?? '',
                                      pixCopiaECola: m.cobrancaPixCopiaECola,
                                      valor: m.valor,
                                      valorCobrado: m.cobrancaValorCobrado,
                                      competencia: `${MESES[m.competenciaMes - 1]}/${m.competenciaAno}`,
                                      nomeAssociado: nomeMap[m.associadoId],
                                    })}
                                  >
                                    <QrCode className="h-3.5 w-3.5 mr-1" />
                                    Ver PIX
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-muted-foreground"
                                    onClick={() => setCancelarId(m.id)}
                                    title="Cancelar cobrança no gateway"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Cancelar
                                  </Button>
                                </>
                              )}
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
                          {m.status === 'PAGO' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-muted-foreground"
                              onClick={() => setEstornarId(m.id)}
                            >
                              <Undo2 className="h-3.5 w-3.5 mr-1" />
                              Estornar
                            </Button>
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

      {/* Dialog: Quitar */}
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

      {/* Dialog: Isentar */}
      <Dialog open={!!isentarId} onOpenChange={(o) => { if (!o) setIsentarId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Isentar Mensalidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="motivo-isencao">Motivo (opcional)</Label>
            <Textarea
              id="motivo-isencao"
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

      {/* Dialog: Cancelar cobrança PIX */}
      <Dialog open={!!cancelarId} onOpenChange={(o) => { if (!o) setCancelarId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancelar Cobrança PIX</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            A cobrança será removida do sistema. O link de pagamento gerado anteriormente pode
            continuar ativo no gateway até seu vencimento natural.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelarId(null)}>Voltar</Button>
            <Button variant="destructive" onClick={() => void handleCancelarCobranca()} disabled={cancelando}>
              {cancelando ? 'Cancelando...' : 'Cancelar cobrança'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Estornar */}
      <Dialog open={!!estornarId} onOpenChange={(o) => { if (!o) setEstornarId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Estornar Mensalidade</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            A mensalidade voltará ao status <strong>PENDENTE</strong> e um movimento de estorno
            será registrado no financeiro. Esta ação não realiza devolução bancária automática.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEstornarId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => void handleEstornar()} disabled={estornando}>
              {estornando ? 'Estornando...' : 'Confirmar estorno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir mensalidade */}
      <Dialog open={!!excluirId} onOpenChange={(o) => { if (!o) setExcluirId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Mensalidade</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            A mensalidade será <strong>removida permanentemente</strong>. Após a exclusão, clique em{' '}
            <strong>"Gerar"</strong> para recriar com o valor atual das configurações.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExcluirId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => void handleExcluir()} disabled={excluindo}>
              {excluindo ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: PIX emitido */}
      <Dialog open={!!pixDialog} onOpenChange={(o) => { if (!o) setPixDialog(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cobrança PIX Emitida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Resumo da cobrança */}
            <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-1.5 text-sm">
              {pixDialog?.nomeAssociado && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Associado</span>
                  <span className="font-medium">{pixDialog.nomeAssociado}</span>
                </div>
              )}
              {pixDialog?.competencia && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Competência</span>
                  <span className="font-medium">{pixDialog.competencia}</span>
                </div>
              )}
              {pixDialog?.valor !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensalidade</span>
                  <span className="font-medium">{fmt(pixDialog.valor)}</span>
                </div>
              )}
              {pixDialog?.valorCobrado !== undefined && pixDialog.valor !== undefined && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa gateway</span>
                  <span>+ {fmt(pixDialog.valorCobrado - pixDialog.valor)}</span>
                </div>
              )}
              {pixDialog?.valorCobrado !== undefined ? (
                <div className="flex justify-between items-center border-t pt-1.5 mt-1">
                  <span className="font-medium">Total a pagar</span>
                  <span className="font-semibold text-base">{fmt(pixDialog.valorCobrado)}</span>
                </div>
              ) : pixDialog?.valor !== undefined ? (
                <div className="flex justify-between items-center border-t pt-1.5 mt-1">
                  <span className="font-medium">Total a pagar</span>
                  <span className="font-semibold text-base">{fmt(pixDialog.valor)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vencimento</span>
                <span className="font-medium">3 dias</span>
              </div>
            </div>

            {pixDialog?.pixCopiaECola && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-muted-foreground">Escaneie com o app do banco:</p>
                  <div className="p-3 bg-white rounded-lg border">
                    <QRCode value={pixDialog.pixCopiaECola} size={160} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>PIX Copia e Cola</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono bg-muted rounded p-2 break-all select-all flex-1 cursor-text">
                      {pixDialog.pixCopiaECola}
                    </p>
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0 h-8 w-8"
                      onClick={() => {
                        void navigator.clipboard.writeText(pixDialog.pixCopiaECola!)
                        toast.success('Código copiado!')
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {pixDialog?.link && (
              <a
                href={pixDialog.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                Abrir página de pagamento (Mercado Pago)
              </a>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPixDialog(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
