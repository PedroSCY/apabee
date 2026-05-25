'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isPending: boolean
}

export function ExcluirMensalidadeDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir Mensalidade</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          A mensalidade será <strong>removida permanentemente</strong>. Após a exclusão, clique em{' '}
          <strong>"Gerar"</strong> para recriar com o valor atual das configurações.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => void onConfirm()} disabled={isPending}>
            {isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
