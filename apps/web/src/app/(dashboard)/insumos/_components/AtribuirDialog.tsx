'use client'

import * as React from 'react'
import { UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type AtribuirTarget = { id: string; tipoPatrimonio: 'EQUIPAMENTO' | 'INSUMO'; nome: string }

interface Props {
  target: AtribuirTarget | null
  onClose: () => void
  associados: Array<{ id: string; usuario: { nome: string } }>
  onConfirm: (associadoId: string, observacao?: string) => Promise<void>
}

export function AtribuirDialog({ target, onClose, associados, onConfirm }: Props) {
  const [associadoId, setAssociadoId] = React.useState('')
  const [observacao, setObservacao] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (target) { setAssociadoId(''); setObservacao('') }
  }, [target])

  async function handle() {
    if (!associadoId) { toast.error('Selecione um associado.'); return }
    setLoading(true)
    try { await onConfirm(associadoId, observacao || undefined) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir — {target?.nome}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Associado</Label>
            <Select value={associadoId} onValueChange={setAssociadoId}>
              <SelectTrigger><SelectValue placeholder="Selecione um associado ativo" /></SelectTrigger>
              <SelectContent>
                {associados.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)}
              placeholder="Instruções ou observações…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handle} disabled={loading}>
            <UserCheck className="mr-2 h-4 w-4" />Atribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
