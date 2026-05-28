'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePedidoLoja, useRenovarPix } from '@/hooks/useLoja'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * Countdown regressivo a partir de `expiracaoEm`.
 * Chama `onExpired` uma única vez quando chegar a zero.
 * Reseta automaticamente se `expiracaoEm` mudar (após renovação do PIX).
 */
function Countdown({
  expiracaoEm,
  onExpired,
}: {
  expiracaoEm: string
  onExpired?: () => void
}) {
  const firedRef = useRef(false)

  const [segundos, setSegundos] = useState(() => {
    const diff = Math.floor((new Date(expiracaoEm).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })

  // Reseta contador quando expiracaoEm mudar (renovação do PIX)
  useEffect(() => {
    const diff = Math.floor((new Date(expiracaoEm).getTime() - Date.now()) / 1000)
    setSegundos(Math.max(0, diff))
    firedRef.current = false
  }, [expiracaoEm])

  // Decrementa 1s por vez e dispara onExpired quando zera
  useEffect(() => {
    if (segundos <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        onExpired?.()
      }
      return
    }
    const t = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [segundos, onExpired])

  const min = Math.floor(segundos / 60)
  const sec = segundos % 60
  return (
    <span className={segundos < 120 ? 'text-red-500 font-semibold' : ''}>
      {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
    </span>
  )
}

interface PixPaymentScreenProps {
  pedidoId: string
  pixCopiaECola: string
  pixQrCodeBase64?: string
  valorTotal: number
  expiracaoEm: string
  /**
   * Callback chamado quando o pagamento é confirmado (status → PAGO).
   * Se não fornecido, redireciona para /minha-conta/pedidos/:id (comportamento padrão pós-checkout).
   * Use este prop quando o componente for exibido inline na página de detalhe do pedido
   * para evitar que o router.push navegue para a mesma URL.
   */
  onPago?: () => void
}

export function PixPaymentScreen({
  pedidoId,
  pixCopiaECola,
  pixQrCodeBase64,
  valorTotal,
  expiracaoEm,
  onPago,
}: PixPaymentScreenProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  // [B1] expirado como estado reativo — atualizado pelo Countdown via onExpired
  // e resetado quando expiracaoEm mudar (após renovação pelo pai)
  const [expirado, setExpirado] = useState(() => new Date(expiracaoEm).getTime() < Date.now())

  useEffect(() => {
    setExpirado(new Date(expiracaoEm).getTime() < Date.now())
  }, [expiracaoEm])

  const { data: pedido } = usePedidoLoja(pedidoId, true)
  const renovar = useRenovarPix()

  useEffect(() => {
    if (pedido?.status === 'PAGO') {
      if (onPago) {
        onPago()
      } else {
        router.push(`/minha-conta/pedidos/${pedidoId}`)
      }
    }
  }, [pedido?.status, pedidoId, router, onPago])

  async function copiar() {
    await navigator.clipboard.writeText(pixCopiaECola)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto text-center">
      <div>
        <h2 className="text-lg font-semibold">Pedido #{pedidoId.slice(0, 8)}</h2>
        <p className="text-2xl font-bold text-primary mt-1">{fmt(valorTotal)}</p>
      </div>

      {pixQrCodeBase64 && (
        <div className="rounded-xl border border-border p-3 bg-white">
          <Image
            src={`data:image/png;base64,${pixQrCodeBase64}`}
            alt="QR Code PIX"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
      )}

      <div className="w-full space-y-2">
        <p className="text-xs text-muted-foreground">Código PIX Copia e Cola</p>
        <div className="flex gap-2">
          <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-xs font-mono truncate text-left">
            {pixCopiaECola}
          </code>
          <Button size="icon" variant="outline" onClick={copiar} className="shrink-0">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expirado ? (
        <div className="w-full space-y-3">
          <p className="text-sm text-red-500 font-medium">PIX expirado</p>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => renovar.mutate(pedidoId)}
            disabled={renovar.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            {renovar.isPending ? 'Gerando novo PIX...' : 'Gerar novo PIX'}
          </Button>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {/* [B2] onExpired marca expirado como true quando o countdown chega a zero */}
          <p>Expira em <Countdown expiracaoEm={expiracaoEm} onExpired={() => setExpirado(true)} /></p>
          <p className="flex items-center justify-center gap-1.5 mt-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Aguardando pagamento...
          </p>
        </div>
      )}
    </div>
  )
}
