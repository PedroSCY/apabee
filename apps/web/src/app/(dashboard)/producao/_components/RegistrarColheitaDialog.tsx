'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCriarColheita, useLotes, useTiposMateriaPrima } from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  associadoId: z.string().min(1, 'Selecione um associado'),
  tipoMateriaPrimaId: z.string().min(1, 'Selecione o tipo'),
  loteProducaoId: z.string().min(1, 'Selecione um lote'),
  volume: z.number().positive('Volume deve ser positivo'),
  unidade: z.string().min(1),
  dataColheita: z.string().min(1, 'Informe a data'),
  observacao: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function RegistrarColheitaDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useCriarColheita()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { data: lotes = [] } = useLotes()
  const { data: associados = [] } = useAssociados()

  const lotesAbertos = lotes.filter((l) => l.status === 'ABERTO')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unidade: 'KG', dataColheita: new Date().toISOString().slice(0, 10) },
  })

  const tipoSelecionadoId = watch('tipoMateriaPrimaId')
  const tipoSelecionado = tipos.find((t) => t.id === tipoSelecionadoId)

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ ...data, unidade: tipoSelecionado?.unidade ?? data.unidade })
      toast.success('Colheita registrada e estoque atualizado!')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao registrar colheita.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold">Registrar Colheita</Dialog.Title>
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
              <label className="text-sm font-medium">Lote (aberto)</label>
              <select {...register('loteProducaoId')} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
                <option value="">Selecione…</option>
                {lotesAbertos.map((l) => (
                  <option key={l.id} value={l.id}>{l.periodo} — {l.tipo}</option>
                ))}
              </select>
              {errors.loteProducaoId && <p className="text-xs text-destructive">{errors.loteProducaoId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo de Matéria-Prima</label>
              <select {...register('tipoMateriaPrimaId')} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
                <option value="">Selecione…</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome} ({t.unidade})</option>
                ))}
              </select>
              {errors.tipoMateriaPrimaId && <p className="text-xs text-destructive">{errors.tipoMateriaPrimaId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Volume</label>
                <input type="number" step="0.001" {...register('volume', { valueAsNumber: true })} placeholder="0.000" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
                {errors.volume && <p className="text-xs text-destructive">{errors.volume.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Unidade</label>
                <input readOnly value={tipoSelecionado?.unidade ?? '—'} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-muted text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Data da Colheita</label>
              <input type="date" {...register('dataColheita')} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
              {errors.dataColheita && <p className="text-xs text-destructive">{errors.dataColheita.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Observação (opcional)</label>
              <textarea rows={2} {...register('observacao')} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none" />
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
