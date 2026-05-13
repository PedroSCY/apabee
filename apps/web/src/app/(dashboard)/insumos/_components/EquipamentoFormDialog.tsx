'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCriarEquipamento, useAtualizarEquipamento } from '@/hooks/useEquipamentos'
import type { EquipamentoResponse } from '@/lib/api/patrimonio'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(120),
  numeroSerie: z.string().max(60).optional(),
  descricao: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipamento?: EquipamentoResponse
}

export function EquipamentoFormDialog({ open, onOpenChange, equipamento }: Props) {
  const isEdit = Boolean(equipamento)
  const { mutateAsync: criar, isPending: criando } = useCriarEquipamento()
  const { mutateAsync: atualizar, isPending: atualizando } = useAtualizarEquipamento()
  const isPending = criando || atualizando

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        nome: equipamento?.nome ?? '',
        numeroSerie: equipamento?.numeroSerie ?? '',
        descricao: equipamento?.descricao ?? '',
      })
    }
  }, [open, equipamento, reset])

  async function onSubmit(data: FormData) {
    try {
      if (isEdit && equipamento) {
        await atualizar({ id: equipamento.id, input: data })
        toast.success('Equipamento atualizado.')
      } else {
        await criar(data)
        toast.success('Equipamento criado.')
      }
      onOpenChange(false)
    } catch {
      toast.error('Erro ao salvar equipamento.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Equipamento' : 'Novo Equipamento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register('nome')} placeholder="Ex: Centrífuga radial 9 quadros" disabled={isPending} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numeroSerie">Número de série</Label>
            <Input id="numeroSerie" {...register('numeroSerie')} placeholder="Ex: SN-2024-001" disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register('descricao')} placeholder="Descrição opcional" disabled={isPending} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" type="button" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
