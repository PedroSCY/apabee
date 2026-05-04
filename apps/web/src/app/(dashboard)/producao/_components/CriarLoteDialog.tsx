'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCriarLote } from '@/hooks/useProducao'

const schema = z.object({
  tipo: z.enum(['PRODUCAO', 'AQUISICAO']),
  periodo: z.string().min(4, 'Informe o período'),
  dataInicio: z.string().min(1, 'Informe a data de início'),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function CriarLoteDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useCriarLote()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'PRODUCAO', periodo: '', dataInicio: '' },
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync(data)
      toast.success('Lote criado com sucesso!')
      onOpenChange(false)
    } catch { toast.error('Erro ao criar lote.') }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
          <Dialog.Title className="text-lg font-semibold">Criar Lote de Produção</Dialog.Title>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <select {...register('tipo')} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
                <option value="PRODUCAO">Produção (colheita)</option>
                <option value="AQUISICAO">Aquisição (compra coletiva)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Período</label>
              <input {...register('periodo')} placeholder="Ex: 2025-01" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
              {errors.periodo && <p className="text-xs text-destructive">{errors.periodo.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Data de Início</label>
              <input type="date" {...register('dataInicio')} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
              {errors.dataInicio && <p className="text-xs text-destructive">{errors.dataInicio.message}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Criando…' : 'Criar Lote'}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
