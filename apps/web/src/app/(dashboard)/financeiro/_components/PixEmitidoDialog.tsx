'use client'

import { Copy, ExternalLink } from 'lucide-react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export interface PixData {
  link: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  valor?: number
  valorCobrado?: number
  competencia?: string
  nomeAssociado?: string
}

interface Props {
  data: PixData | null
  onClose: () => void
}

export function PixEmitidoDialog({ data, onClose }: Props) {
  return (
    <Dialog open={!!data} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cobrança PIX Emitida</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-1.5 text-sm">
            {data?.nomeAssociado && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Associado</span>
                <span className="font-medium">{data.nomeAssociado}</span>
              </div>
            )}
            {data?.competencia && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Competência</span>
                <span className="font-medium">{data.competencia}</span>
              </div>
            )}
            {data?.valor !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mensalidade</span>
                <span className="font-medium">{fmt(data.valor)}</span>
              </div>
            )}
            {data?.valorCobrado !== undefined && data.valor !== undefined && (
              <div className="flex justify-between text-muted-foreground">
                <span>Taxa gateway</span>
                <span>+ {fmt(data.valorCobrado - data.valor)}</span>
              </div>
            )}
            {data?.valorCobrado !== undefined ? (
              <div className="flex justify-between items-center border-t pt-1.5 mt-1">
                <span className="font-medium">Total a pagar</span>
                <span className="font-semibold text-base">{fmt(data.valorCobrado)}</span>
              </div>
            ) : data?.valor !== undefined ? (
              <div className="flex justify-between items-center border-t pt-1.5 mt-1">
                <span className="font-medium">Total a pagar</span>
                <span className="font-semibold text-base">{fmt(data.valor)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vencimento</span>
              <span className="font-medium">3 dias</span>
            </div>
          </div>

          {data?.pixCopiaECola && (
            <>
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">Escaneie com o app do banco:</p>
                <div className="p-3 bg-white rounded-lg border">
                  <QRCode value={data.pixCopiaECola} size={160} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>PIX Copia e Cola</Label>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono bg-muted rounded p-2 break-all select-all flex-1 cursor-text">
                    {data.pixCopiaECola}
                  </p>
                  <Button
                    size="icon" variant="outline" className="shrink-0 h-8 w-8"
                    onClick={() => {
                      void navigator.clipboard.writeText(data.pixCopiaECola!)
                      toast.success('Código copiado!')
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {data?.link && (
            <a
              href={data.link} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              Abrir página de pagamento (Mercado Pago)
            </a>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
