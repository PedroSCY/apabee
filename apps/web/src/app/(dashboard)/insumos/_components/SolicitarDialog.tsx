'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAtribuirPatrimonio } from '@/hooks/useAtribuicoes'

const schema = z.object({
  observacao: z.string().max(500).optional(),
  dataInicio: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  patrimonioId: string
  tipoPatrimonio: string
  patrimonioNome: string
  associadoId: string
}

export function SolicitarDialog({
  open,
  onOpenChange,
  patrimonioId,
  tipoPatrimonio,
  patrimonioNome,
  associadoId,
}: Props) {
  const { mutateAsync: atribuir, isPending } = useAtribuirPatrimonio()

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { observacao: '', dataInicio: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      await atribuir({
        patrimonioId,
        tipoPatrimonio,
        associadoId,
        observacao: data.observacao || undefined,
        dataInicio: data.dataInicio || undefined,
      })
      toast.success(`Solicitação de uso de "${patrimonioNome}" registrada.`)
      reset()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao solicitar uso.'
      toast.error(msg)
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
          <Dialog.Title className="text-base font-semibold mb-1">Solicitar uso</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            {patrimonioNome}
          </Dialog.Description>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">Data de início</Label>
              <Input id="dataInicio" type="date" {...register('dataInicio')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="observacao">Justificativa</Label>
              <Input id="observacao" {...register('observacao')} placeholder="Ex: Utilização no apiário da Fazenda..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm" type="button" disabled={isPending}>
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? 'Enviando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
