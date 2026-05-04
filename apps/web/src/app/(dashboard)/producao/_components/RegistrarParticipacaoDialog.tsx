'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRegistrarParticipacao } from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  associadoId: z.string().min(1, 'Selecione um associado'),
  percentual: z.number().min(0).max(100, 'Máx 100%'),
  volume: z.number().positive().optional(),
  valorInvestido: z.number().positive().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  loteId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function RegistrarParticipacaoDialog({ loteId, open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useRegistrarParticipacao()
  const { data: associados = [] } = useAssociados()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { percentual: 0 },
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ loteId, input: data })
      toast.success('Participação registrada!')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao registrar participação.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
          <Dialog.Title className="text-lg font-semibold">Registrar Participação</Dialog.Title>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Associado</label>
              <select {...register('associadoId')} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
                <option value="">Selecione…</option>
                {associados.map((a) => (
                  <option key={a.id} value={a.id}>{a.usuario.nome}</option>
                ))}
              </select>
              {errors.associadoId && <p className="text-xs text-destructive">{errors.associadoId.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Percentual (%)</label>
              <input type="number" step="0.01" {...register('percentual', { valueAsNumber: true })} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
              {errors.percentual && <p className="text-xs text-destructive">{errors.percentual.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Volume (opcional)</label>
              <input type="number" step="0.001" {...register('volume', { valueAsNumber: true })} placeholder="kg / L…" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Valor Investido (opcional)</label>
              <input type="number" step="0.01" {...register('valorInvestido', { valueAsNumber: true })} placeholder="R$" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Registrando…' : 'Registrar'}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
