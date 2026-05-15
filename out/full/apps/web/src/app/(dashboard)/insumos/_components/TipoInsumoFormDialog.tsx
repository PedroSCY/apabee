'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCriarTipoInsumo, useAtualizarTipoInsumo } from '@/hooks/useInsumos'
import type { TipoInsumoResponse } from '@/lib/api/patrimonio'

const CATEGORIAS = [
  { value: 'FERRAMENTA', label: 'Ferramenta' },
  { value: 'INSUMO', label: 'Insumo' },
]

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(120),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  sigla: z.string().min(1, 'Sigla obrigatória').max(10).regex(/^[A-Za-z]+$/, 'Apenas letras'),
  descricao: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoInsumo?: TipoInsumoResponse
}

export function TipoInsumoFormDialog({ open, onOpenChange, tipoInsumo }: Props) {
  const isEdit = Boolean(tipoInsumo)
  const { mutateAsync: criar, isPending: criando } = useCriarTipoInsumo()
  const { mutateAsync: atualizar, isPending: atualizando } = useAtualizarTipoInsumo()
  const isPending = criando || atualizando

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        nome: tipoInsumo?.nome ?? '',
        categoria: tipoInsumo?.categoria ?? 'FERRAMENTA',
        sigla: tipoInsumo?.sigla ?? '',
        descricao: tipoInsumo?.descricao ?? '',
      })
    }
  }, [open, tipoInsumo, reset])

  async function onSubmit(data: FormData) {
    try {
      if (isEdit && tipoInsumo) {
        await atualizar({ id: tipoInsumo.id, input: { nome: data.nome, sigla: data.sigla, descricao: data.descricao } })
        toast.success('Tipo de insumo atualizado.')
      } else {
        await criar({ nome: data.nome, categoria: data.categoria, sigla: data.sigla, descricao: data.descricao })
        toast.success('Tipo de insumo criado.')
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar tipo de insumo.'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Tipo de Insumo' : 'Novo Tipo de Insumo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register('nome')} placeholder="Ex: Fumigador" disabled={isPending} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit || isPending}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoria && <p className="text-xs text-destructive">{errors.categoria.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sigla">Sigla *</Label>
              <Controller
                control={control}
                name="sigla"
                render={({ field }) => (
                  <Input
                    id="sigla"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    placeholder="Ex: FUM"
                    maxLength={10}
                    disabled={isPending}
                  />
                )}
              />
              {errors.sigla && <p className="text-xs text-destructive">{errors.sigla.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">
              Descrição <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input id="descricao" {...register('descricao')} placeholder="Descrição breve" disabled={isPending} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" type="button" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
