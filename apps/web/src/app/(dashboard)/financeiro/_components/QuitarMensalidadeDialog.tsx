'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Metodo = 'PRESENCIAL' | 'TRANSFERENCIA'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (metodo: Metodo) => Promise<void>
  isPending: boolean
}

export function QuitarMensalidadeDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  const [metodo, setMetodo] = React.useState<Metodo>('PRESENCIAL')

  async function handle() {
    await onConfirm(metodo)
    setMetodo('PRESENCIAL')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Quitar Mensalidade</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Método de pagamento</Label>
          <Select value={metodo} onValueChange={(v) => setMetodo(v as Metodo)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PRESENCIAL">Presencial</SelectItem>
              <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => void handle()} disabled={isPending}>
            {isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
