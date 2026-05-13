'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCriarInsumo, useAtualizarInsumo } from '@/hooks/useInsumos'
import type { InsumoResponse } from '@/lib/api/patrimonio'

const CATEGORIAS = [
  { value: 'FERRAMENTA', label: 'Ferramenta' },
  { value: 'INSUMO', label: 'Insumo' },
]

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(120),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  descricao: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  insumo?: InsumoResponse
}

export function InsumoFormDialog({ open, onOpenChange, insumo }: Props) {
  const isEdit = Boolean(insumo)
  const { mutateAsync: criar, isPending: criando } = useCriarInsumo()
  const { mutateAsync: atualizar, isPending: atualizando } = useAtualizarInsumo()
  const isPending = criando || atualizando

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        nome: insumo?.nome ?? '',
        categoria: insumo?.categoria ?? 'FERRAMENTA',
        descricao: insumo?.descricao ?? '',
      })
    }
  }, [open, insumo, reset])

  async function onSubmit(data: FormData) {
    try {
      if (isEdit && insumo) {
        await atualizar({ id: insumo.id, input: { nome: data.nome, descricao: data.descricao } })
        toast.success('Insumo atualizado.')
      } else {
        await criar(data)
        toast.success('Insumo criado.')
      }
      onOpenChange(false)
    } catch {
      toast.error('Erro ao salvar insumo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register('nome')} placeholder="Ex: Fumigador metálico" disabled={isPending} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria *</Label>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isEdit || isPending}>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
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
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register('descricao')} placeholder="Descrição opcional" disabled={isPending} />
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
