'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCriarSolicitacao } from '@/hooks/useSolicitacoes'

const schema = z.object({
  justificativa: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  patrimonioId: string
  tipoPatrimonio: string
  patrimonioNome: string
}

export function SolicitarDialog({
  open,
  onOpenChange,
  patrimonioId,
  tipoPatrimonio,
  patrimonioNome,
}: Props) {
  const { mutateAsync: criar, isPending } = useCriarSolicitacao()

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { justificativa: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      await criar({
        patrimonioId,
        tipoPatrimonio,
        justificativa: data.justificativa || undefined,
      })
      toast.success(`Solicitação de uso de "${patrimonioNome}" enviada para aprovação.`)
      reset()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar solicitação.'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar uso</DialogTitle>
          <DialogDescription>
            {patrimonioNome} — sua solicitação será analisada pelo administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="justificativa">Justificativa <span className="text-muted-foreground">(opcional)</span></Label>
            <Textarea
              id="justificativa"
              {...register('justificativa')}
              placeholder="Ex: Utilização no apiário da Fazenda São João durante a colheita de inverno…"
              rows={3}
              disabled={isPending}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" type="button" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
