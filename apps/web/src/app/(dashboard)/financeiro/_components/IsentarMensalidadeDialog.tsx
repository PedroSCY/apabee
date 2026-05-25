'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (motivo?: string) => Promise<void>
  isPending: boolean
}

export function IsentarMensalidadeDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  const [motivo, setMotivo] = React.useState('')

  async function handle() {
    await onConfirm(motivo || undefined)
    setMotivo('')
  }

  function handleClose(o: boolean) {
    if (!o) setMotivo('')
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          <Button variant="ghost" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={() => void handle()} disabled={isPending}>
            {isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
