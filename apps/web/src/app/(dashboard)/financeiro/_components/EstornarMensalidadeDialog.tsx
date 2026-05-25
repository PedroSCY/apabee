'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isPending: boolean
}

export function EstornarMensalidadeDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Estornar Mensalidade</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          A mensalidade voltará ao status <strong>PENDENTE</strong> e um movimento de estorno
          será registrado no financeiro. Esta ação não realiza devolução bancária automática.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => void onConfirm()} disabled={isPending}>
            {isPending ? 'Estornando...' : 'Confirmar estorno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
