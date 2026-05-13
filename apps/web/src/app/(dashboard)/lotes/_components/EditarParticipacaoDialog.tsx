'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAtualizarParticipacao } from '@/hooks/useProducao'
import type { ApiError } from '@/lib/api/client'
import type { ParticipacaoLoteResponse } from '@/lib/api/producao'

const schema = z.object({
  volume: z.number().positive().optional(),
  valorInvestido: z.number().positive().optional(),
  percentualManual: z.boolean(),
  percentual: z.number().min(0).max(100).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  loteId: string
  loteTipo: string
  participacao: ParticipacaoLoteResponse
  nomAssociado: string
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function EditarParticipacaoDialog({ loteId, loteTipo, participacao, nomAssociado, open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useAtualizarParticipacao()
  const isProducao = loteTipo === 'PRODUCAO'

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      volume: participacao.volume ?? undefined,
      valorInvestido: participacao.valorInvestido ?? undefined,
      percentualManual: participacao.percentualManual,
      percentual: participacao.percentual,
    },
  })

  const percentualManualAtivo = watch('percentualManual')

  React.useEffect(() => {
    if (open) {
      reset({
        volume: participacao.volume ?? undefined,
        valorInvestido: participacao.valorInvestido ?? undefined,
        percentualManual: participacao.percentualManual,
        percentual: participacao.percentual,
      })
    }
  }, [open, participacao, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({
        loteId,
        associadoId: participacao.associadoId,
        input: {
          volume: data.volume,
          valorInvestido: data.valorInvestido,
          percentualManual: data.percentualManual,
          percentual: data.percentualManual ? data.percentual : undefined,
        },
      })
      toast.success('Participação atualizada!')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao atualizar participação.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Participação</DialogTitle>
          <DialogDescription>{nomAssociado}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {isProducao ? (
            <div className="space-y-1.5">
              <Label htmlFor="volume">Volume produzido (kg / L)</Label>
              <Input
                id="volume"
                type="number"
                step="0.001"
                {...register('volume', { valueAsNumber: true })}
                disabled={isPending}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="valorInvestido">Valor investido (R$)</Label>
              <Input
                id="valorInvestido"
                type="number"
                step="0.01"
                {...register('valorInvestido', { valueAsNumber: true })}
                disabled={isPending}
              />
            </div>
          )}

          <div className="rounded-md border border-border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Percentual calculado</p>
                <p className="text-xs text-muted-foreground">
                  {participacao.percentualManual ? 'Override manual ativo' : 'Automático'}
                </p>
              </div>
              <span className="text-lg font-semibold tabular-nums">
                {participacao.percentual.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border">
              <Label htmlFor="percentualManual" className="text-xs text-muted-foreground cursor-pointer">
                Definir percentual manualmente
              </Label>
              <Switch
                id="percentualManual"
                checked={percentualManualAtivo}
                onCheckedChange={(v) => setValue('percentualManual', v)}
                disabled={isPending}
              />
            </div>

            {percentualManualAtivo && (
              <div className="space-y-1.5">
                <Label htmlFor="percentual">Percentual manual (%)</Label>
                <Input
                  id="percentual"
                  type="number"
                  step="0.01"
                  {...register('percentual', { valueAsNumber: true })}
                  disabled={isPending}
                />
                {errors.percentual && <p className="text-xs text-destructive">{errors.percentual.message}</p>}
                <p className="text-xs text-muted-foreground">
                  O rateio dos demais associados será recalculado proporcionalmente.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando…' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
