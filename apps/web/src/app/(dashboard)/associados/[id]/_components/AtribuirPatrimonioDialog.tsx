'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEquipamentos } from '@/hooks/useEquipamentos'
import { useInsumos } from '@/hooks/useInsumos'
import { useAtribuirPatrimonio } from '@/hooks/useAtribuicoes'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  associadoId: string
}

export function AtribuirPatrimonioDialog({ open, onOpenChange, associadoId }: Props) {
  const [tipo, setTipo] = useState<'EQUIPAMENTO' | 'INSUMO'>('EQUIPAMENTO')
  const [patrimonioId, setPatrimonioId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [observacao, setObservacao] = useState('')

  const { data: equipamentos = [] } = useEquipamentos()
  const { data: insumos = [] } = useInsumos()
  const { mutateAsync: atribuir, isPending } = useAtribuirPatrimonio()

  const disponiveis =
    tipo === 'EQUIPAMENTO'
      ? equipamentos.filter((e) => e.status === 'DISPONIVEL')
      : insumos.filter((i) => i.status === 'DISPONIVEL')

  const nomeItem = disponiveis.find((i) => i.id === patrimonioId)?.nome ?? ''

  function handleClose() {
    setTipo('EQUIPAMENTO')
    setPatrimonioId('')
    setDataInicio('')
    setObservacao('')
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patrimonioId) return

    try {
      await atribuir({
        patrimonioId,
        tipoPatrimonio: tipo,
        associadoId,
        dataInicio: dataInicio || undefined,
        observacao: observacao || undefined,
      })
      toast.success(`"${nomeItem}" atribuído com sucesso.`)
      handleClose()
    } catch {
      toast.error('Erro ao atribuir patrimônio. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Patrimônio</DialogTitle>
          <DialogDescription>Selecione o item disponível e registre a atribuição.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => { setTipo(v as typeof tipo); setPatrimonioId('') }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUIPAMENTO">Equipamento</SelectItem>
                <SelectItem value="INSUMO">Insumo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Item</Label>
            <Select value={patrimonioId} onValueChange={setPatrimonioId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um item disponível" />
              </SelectTrigger>
              <SelectContent>
                {disponiveis.length === 0 && (
                  <SelectItem value="__none__" disabled>Nenhum item disponível</SelectItem>
                )}
                {disponiveis.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dataInicio">Data de início</Label>
            <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="obs">Observação</Label>
            <Input id="obs" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Opcional" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !patrimonioId}>
              {isPending ? 'Atribuindo…' : 'Confirmar atribuição'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
