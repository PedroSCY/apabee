'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md rounded-xl bg-card p-6 shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )}>
          <Dialog.Title className="text-base font-semibold mb-4">
            {isEdit ? 'Editar Equipamento' : 'Novo Equipamento'}
          </Dialog.Title>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" {...register('nome')} placeholder="Ex: Centrífuga radial 9 quadros" />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numeroSerie">Número de série</Label>
              <Input id="numeroSerie" {...register('numeroSerie')} placeholder="Ex: SN-2024-001" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" {...register('descricao')} placeholder="Descrição opcional" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm" type="button" disabled={isPending}>
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
