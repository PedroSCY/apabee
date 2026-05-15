'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  quantidade: z.number().int().min(1).max(100).optional(),
  justificativa: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

type Props =
  | {
      open: boolean
      onOpenChange: (open: boolean) => void
      tipoPatrimonio: 'EQUIPAMENTO'
      patrimonioId: string
      patrimonioNome: string
    }
  | {
      open: boolean
      onOpenChange: (open: boolean) => void
      tipoPatrimonio: 'INSUMO'
      tipoInsumoId: string
      tipoInsumoNome: string
      unidadesDisponiveis: number
    }

export function SolicitarDialog(props: Props) {
  const { open, onOpenChange, tipoPatrimonio } = props
  const { mutateAsync: criar, isPending } = useCriarSolicitacao()

  const titulo = tipoPatrimonio === 'EQUIPAMENTO' ? props.patrimonioNome : props.tipoInsumoNome

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantidade: 1, justificativa: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      if (tipoPatrimonio === 'EQUIPAMENTO') {
        await criar({
          tipoPatrimonio: 'EQUIPAMENTO',
          patrimonioId: props.patrimonioId,
          justificativa: data.justificativa || undefined,
        })
      } else {
        const qtd = data.quantidade ?? 1
        if (qtd > props.unidadesDisponiveis) {
          toast.error(`Apenas ${props.unidadesDisponiveis} unidade(s) disponível(is).`)
          return
        }
        await criar({
          tipoPatrimonio: 'INSUMO',
          tipoInsumoId: props.tipoInsumoId,
          quantidade: qtd,
          justificativa: data.justificativa || undefined,
        })
      }
      toast.success(`Solicitação de "${titulo}" enviada para aprovação.`)
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
            {titulo} — sua solicitação será analisada pelo administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {tipoPatrimonio === 'INSUMO' && (
            <div className="space-y-1.5">
              <Label htmlFor="quantidade">
                Quantidade * <span className="text-muted-foreground text-xs">({props.unidadesDisponiveis} disponível(is))</span>
              </Label>
              <Input
                id="quantidade"
                type="number"
                min={1}
                max={props.unidadesDisponiveis}
                {...register('quantidade', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.quantidade && <p className="text-xs text-destructive">{errors.quantidade.message}</p>}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="justificativa">
              Justificativa <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Textarea
              id="justificativa"
              {...register('justificativa')}
              placeholder="Ex: Utilização no apiário da Fazenda São João durante a colheita…"
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
