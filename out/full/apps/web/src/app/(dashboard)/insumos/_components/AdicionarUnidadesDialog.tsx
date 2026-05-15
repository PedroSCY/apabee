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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAdicionarUnidades } from '@/hooks/useInsumos'
import type { TipoInsumoResponse } from '@/lib/api/patrimonio'

const schema = z.object({
  quantidade: z.number().int().min(1, 'Mínimo 1').max(100, 'Máximo 100 por vez'),
  descricao: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoInsumo: TipoInsumoResponse | null
}

export function AdicionarUnidadesDialog({ open, onOpenChange, tipoInsumo }: Props) {
  const { mutateAsync: adicionar, isPending } = useAdicionarUnidades()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantidade: 1, descricao: '' },
  })

  useEffect(() => {
    if (open) reset({ quantidade: 1, descricao: '' })
  }, [open, reset])

  async function onSubmit(data: FormData) {
    if (!tipoInsumo) return
    try {
      const novas = await adicionar({
        tipoId: tipoInsumo.id,
        input: { quantidade: data.quantidade, descricao: data.descricao || undefined },
      })
      toast.success(`${novas.length} unidade(s) adicionada(s) a "${tipoInsumo.nome}".`)
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar unidades.'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar Unidades</DialogTitle>
          {tipoInsumo && (
            <DialogDescription>
              {tipoInsumo.nome} — <span className="font-mono">{tipoInsumo.sigla}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              min={1}
              max={100}
              {...register('quantidade', { valueAsNumber: true })}
              disabled={isPending}
            />
            {errors.quantidade && <p className="text-xs text-destructive">{errors.quantidade.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">
              Descrição <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input
              id="descricao"
              {...register('descricao')}
              placeholder="Observações sobre estas unidades"
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" type="button" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
