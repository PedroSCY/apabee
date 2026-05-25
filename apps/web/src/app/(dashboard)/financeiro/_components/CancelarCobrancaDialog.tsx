'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isPending: boolean
}

export function CancelarCobrancaDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancelar Cobrança PIX</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          A cobrança será removida do sistema. O link de pagamento gerado anteriormente pode
          continuar ativo no gateway até seu vencimento natural.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button variant="destructive" onClick={() => void onConfirm()} disabled={isPending}>
            {isPending ? 'Cancelando...' : 'Cancelar cobrança'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
