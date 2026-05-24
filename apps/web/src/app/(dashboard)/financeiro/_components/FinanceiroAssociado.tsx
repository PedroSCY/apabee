'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  QrCode,
  Undo2,
} from 'lucide-react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared'
import {
  useMeusMovimentos,
  useMinhasMensalidades,
  useSolicitarPix,
} from '@/hooks/useFinanceiro'
import type { MensalidadeResponse, TipoMovimento } from '@/lib/api/financeiro'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400' },
  PAGO:     { label: 'Pago',     className: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
  ISENTO:   { label: 'Isento',   className: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400' },
}

const TIPO_MOVIMENTO_CONFIG: Record<TipoMovimento, { label: string; cor: string }> = {
  MENSALIDADE:  { label: 'Mensalidade',  cor: 'text-emerald-600' },
  ANTECIPACAO:  { label: 'Antecipação',  cor: 'text-amber-600'   },
  RATEIO_FINAL: { label: 'Rateio Final', cor: 'text-blue-600'    },
  CUSTO:        { label: 'Custo',        cor: 'text-red-500'     },
}

// ── KPIs ────────────────────────────────────────────────────────────────────

function KpisMensalidades({ mensalidades }: { mensalidades: MensalidadeResponse[] }) {
  const pagas    = mensalidades.filter((m) => m.status === 'PAGO').length
  const pendentes = mensalidades.filter((m) => m.status === 'PENDENTE')
  const totalDevido = pendentes.reduce((s, m) => s + m.valor, 0)
  const isentas  = mensalidades.filter((m) => m.status === 'ISENTO').length

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs text-muted-foreground">Pagas no ano</p>
          </div>
          <p className="text-2xl font-bold">{pagas}</p>
        </CardContent>
      </Card>
      <Card className={pendentes.length > 0 ? 'border-amber-300 dark:border-amber-800' : ''}>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <p className="text-2xl font-bold">{pendentes.length}</p>
          {totalDevido > 0 && (
            <p className="text-xs text-amber-600 mt-0.5">{fmt(totalDevido)} em aberto</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Undo2 className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-muted-foreground">Isentas</p>
          </div>
          <p className="text-2xl font-bold">{isentas}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Tab: Mensalidades ────────────────────────────────────────────────────────

function MensalidadesTab() {
  const { data: mensalidades = [], isLoading } = useMinhasMensalidades()
  const { mutateAsync: solicitarPix, isPending: solicitando } = useSolicitarPix()

  const [pixDialog, setPixDialog] = React.useState<{
    link: string
    pixCopiaECola?: string
    pixQrCodeBase64?: string
    valor?: number
    valorCobrado?: number
    competencia?: string
  } | null>(null)

  async function handleSolicitarPix(id: string, m: { valor: number; competenciaAno: number; competenciaMes: number }) {
    try {
      const resultado = await solicitarPix(id)
      setPixDialog({
        link: resultado.linkPagamento,
        pixCopiaECola: resultado.pixCopiaECola,
        pixQrCodeBase64: resultado.pixQrCodeBase64,
        valor: m.valor,
        valorCobrado: resultado.valorCobrado,
        competencia: `${MESES[m.competenciaMes - 1]}/${m.competenciaAno}`,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao solicitar PIX.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (mensalidades.length === 0) {
    return (
      <EmptyState
        title="Nenhuma mensalidade"
        description="Você ainda não possui mensalidades geradas."
        className="py-16"
      />
    )
  }

  // Agrupa por ano (decrescente) para facilitar leitura
  const anos = [...new Set(mensalidades.map((m) => m.competenciaAno))].sort((a, b) => b - a)

  return (
    <>
      <div className="space-y-6">
        <KpisMensalidades mensalidades={mensalidades} />

        {anos.map((ano) => {
          const doAno = mensalidades
            .filter((m) => m.competenciaAno === ano)
            .sort((a, b) => b.competenciaMes - a.competenciaMes)

          return (
            <Card key={ano}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{ano}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
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
                    {doAno.map((m) => {
                      const statusCfg = STATUS_CONFIG[m.status] ?? { label: m.status, className: '' }
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            {MESES[m.competenciaMes - 1]}
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
                                  title="Abrir link de pagamento"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <QrCode className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.dataPagamento
                              ? format(parseISO(m.dataPagamento), 'dd/MM/yyyy', { locale: ptBR })
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {m.status === 'PENDENTE' && !m.cobrancaGatewayId && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => void handleSolicitarPix(m.id, m)}
                                disabled={solicitando}
                              >
                                <QrCode className="h-3.5 w-3.5 mr-1" />
                                Pagar via PIX
                              </Button>
                            )}
                            {m.status === 'PENDENTE' && m.cobrancaLink && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs"
                                onClick={() => setPixDialog({
                                  link: m.cobrancaLink!,
                                  pixCopiaECola: m.cobrancaPixCopiaECola,
                                  valor: m.valor,
                                  valorCobrado: m.cobrancaValorCobrado,
                                  competencia: `${MESES[m.competenciaMes - 1]}/${m.competenciaAno}`,
                                })}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Ver PIX
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog: PIX */}
      <Dialog open={!!pixDialog} onOpenChange={(o) => { if (!o) setPixDialog(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pagar via PIX</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Resumo da cobrança */}
            <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-1.5 text-sm">
              {pixDialog?.competencia && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensalidade</span>
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
                <span className="text-muted-foreground">Chave PIX</span>
                <span className="font-medium">APA — Associação</span>
              </div>
            </div>

            {pixDialog?.pixCopiaECola && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-muted-foreground">Escaneie com o app do seu banco:</p>
                  <div className="p-3 bg-white rounded-lg border">
                    <QRCode value={pixDialog.pixCopiaECola} size={160} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>PIX Copia e Cola</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono bg-muted rounded p-2 break-all select-all cursor-text flex-1">
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

// ── Tab: Movimentos ──────────────────────────────────────────────────────────

function MovimentosTab() {
  const { data: movimentos = [], isLoading } = useMeusMovimentos()

  const totalEntradas = movimentos.filter((m) => m.valor > 0).reduce((s, m) => s + m.valor, 0)
  const totalSaidas = movimentos.filter((m) => m.valor < 0).reduce((s, m) => s + Math.abs(m.valor), 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <p className="text-xs text-muted-foreground">Total recebido</p>
            </div>
            <p className="text-xl font-bold text-emerald-600">{fmt(totalEntradas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Total debitado</p>
            </div>
            <p className="text-xl font-bold text-red-500">{fmt(totalSaidas)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Extrato</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {movimentos.length === 0 ? (
            <EmptyState
              title="Nenhum movimento"
              description="Seu histórico financeiro aparecerá aqui após participar de campanhas ou pagar mensalidades."
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentos.map((m) => {
                  const cfg = TIPO_MOVIMENTO_CONFIG[m.tipo as TipoMovimento] ?? { label: m.tipo, cor: 'text-foreground' }
                  const isPositivo = m.valor >= 0
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(parseISO(m.data as unknown as string), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm max-w-50 truncate">
                        {m.descricao ?? '—'}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${cfg.cor}`}>{cfg.label}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`flex items-center justify-end gap-1 text-sm font-semibold tabular-nums ${
                          isPositivo ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {isPositivo
                            ? <ArrowUpRight className="h-3.5 w-3.5" />
                            : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {isPositivo ? '' : '−'}{fmt(Math.abs(m.valor))}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function FinanceiroAssociado() {
  return (
    <Tabs defaultValue="mensalidades">
      <TabsList className="mb-6">
        <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
        <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
      </TabsList>

      <TabsContent value="mensalidades">
        <MensalidadesTab />
      </TabsContent>

      <TabsContent value="movimentos">
        <MovimentosTab />
      </TabsContent>
    </Tabs>
  )
}
