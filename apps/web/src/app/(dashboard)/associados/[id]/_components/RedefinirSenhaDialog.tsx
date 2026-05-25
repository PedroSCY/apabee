'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (novaSenha: string) => Promise<void>
  isPending: boolean
}

export function RedefinirSenhaDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')

  function handleClose(o: boolean) {
    if (!o) { setNovaSenha(''); setConfirmarSenha(''); setErro('') }
    onOpenChange(o)
  }

  async function handle() {
    if (novaSenha.length < 8) { setErro('A senha deve ter no mínimo 8 caracteres.'); return }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }
    await onConfirm(novaSenha)
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="novaSenha">Nova senha</Label>
            <Input
              id="novaSenha" type="password" placeholder="Mín. 8 caracteres"
              value={novaSenha}
              onChange={(e) => { setNovaSenha(e.target.value); setErro('') }}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
            <Input
              id="confirmarSenha" type="password" placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => { setConfirmarSenha(e.target.value); setErro('') }}
              disabled={isPending}
            />
          </div>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleClose(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => void handle()} disabled={isPending}>
            {isPending ? 'Salvando…' : 'Redefinir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
