'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAtualizarParticipacao } from '@/hooks/useProducao'
import type { ApiError } from '@/lib/api/client'
import type { ParticipacaoLoteResponse } from '@/lib/api/producao'

const schema = z.object({
  percentual: z.number().min(0).max(100, 'Máx 100%'),
  volume: z.number().positive().optional(),
  valorInvestido: z.number().positive().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  loteId: string
  participacao: ParticipacaoLoteResponse
  nomAssociado: string
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function EditarParticipacaoDialog({ loteId, participacao, nomAssociado, open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useAtualizarParticipacao()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      percentual: participacao.percentual,
      volume: participacao.volume ?? undefined,
      valorInvestido: participacao.valorInvestido ?? undefined,
    },
  })

  React.useEffect(() => {
    if (open) {
      reset({
        percentual: participacao.percentual,
        volume: participacao.volume ?? undefined,
        valorInvestido: participacao.valorInvestido ?? undefined,
      })
    }
  }, [open, participacao, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ loteId, associadoId: participacao.associadoId, input: data })
      toast.success('Participação atualizada!')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao atualizar participação.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
          <Dialog.Title className="text-lg font-semibold">Editar Participação</Dialog.Title>
          <p className="text-sm text-muted-foreground">{nomAssociado}</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Percentual (%)</label>
              <input type="number" step="0.01"
                {...register('percentual', { valueAsNumber: true })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
              {errors.percentual && <p className="text-xs text-destructive">{errors.percentual.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Volume (opcional)</label>
              <input type="number" step="0.001"
                {...register('volume', { valueAsNumber: true })}
                placeholder="kg / L…"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Valor Investido (opcional)</label>
              <input type="number" step="0.01"
                {...register('valorInvestido', { valueAsNumber: true })}
                placeholder="R$"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Salvando…' : 'Salvar'}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
