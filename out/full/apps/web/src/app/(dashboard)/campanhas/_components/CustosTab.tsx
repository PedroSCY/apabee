'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Trash2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencyInput, EmptyState } from '@/components/shared'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCustos, useRegistrarCusto, useRemoverCusto } from '@/hooks/useCampanhas'
import type { CategoriaCusto, StatusCampanha } from '@/lib/api/campanhas'

const CATEGORIAS: Array<{ value: CategoriaCusto; label: string }> = [
  { value: 'EMBALAGEM', label: 'Embalagem' },
  { value: 'ROTULO', label: 'Rótulo' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'PROCESSAMENTO', label: 'Processamento' },
  { value: 'CERTIFICACAO', label: 'Certificação' },
  { value: 'TAXA', label: 'Taxa' },
  { value: 'PERDA', label: 'Perda' },
  { value: 'MAO_DE_OBRA_CONTRATADA', label: 'Mão de Obra Contratada' },
  { value: 'OUTRO', label: 'Outro' },
]

const schema = z.object({
  descricao: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  categoria: z.enum([
    'EMBALAGEM', 'ROTULO', 'TRANSPORTE', 'PROCESSAMENTO',
    'CERTIFICACAO', 'TAXA', 'PERDA', 'MAO_DE_OBRA_CONTRATADA', 'OUTRO',
  ]),
})
type FormData = z.infer<typeof schema>

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
}

export function CustosTab({ campanhaId, statusCampanha }: Props) {
  const [formAberto, setFormAberto] = React.useState(false)
  const { data: custos = [], isLoading } = useCustos(campanhaId)
  const { mutateAsync: registrar, isPending: registrando } = useRegistrarCusto(campanhaId)
  const { mutateAsync: remover } = useRemoverCusto(campanhaId)

  const podeEditar = statusCampanha === 'ATIVA' || statusCampanha === 'PLANEJADA'

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { descricao: '', categoria: 'OUTRO' },
  })

  async function onSubmit(data: FormData) {
    try {
      await registrar(data)
      toast.success('Custo registrado.')
      form.reset()
      setFormAberto(false)
    } catch {
      toast.error('Erro ao registrar custo.')
    }
  }

  async function handleRemover(id: string) {
    try { await remover(id); toast.success('Custo removido.') }
    catch { toast.error('Erro ao remover custo.') }
  }

  const totalCustos = custos.reduce((acc, c) => acc + c.valor, 0)

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-4">
      {custos.length === 0
        ? <EmptyState title="Nenhum custo registrado" className="py-8" />
        : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  {podeEditar && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {custos.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.descricao}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {CATEGORIAS.find(cat => cat.value === c.categoria)?.label ?? c.categoria}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(parseISO(c.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{fmt(c.valor)}</TableCell>
                    {podeEditar && (
                      <TableCell>
                        <button
                          onClick={() => void handleRemover(c.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={podeEditar ? 3 : 3} className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">{fmt(totalCustos)}</TableCell>
                  {podeEditar && <TableCell />}
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}

      {podeEditar && !formAberto && (
        <Button size="sm" variant="outline" onClick={() => setFormAberto(true)}>
          <Plus className="h-3.5 w-3.5" /> Adicionar Custo
        </Button>
      )}

      {formAberto && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
          <p className="text-sm font-medium">Novo Custo</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Descrição *</Label>
              <Input placeholder="Ex: Embalagens de vidro 300ml" {...form.register('descricao')} disabled={registrando} />
              {form.formState.errors.descricao && (
                <p className="text-xs text-destructive">{form.formState.errors.descricao.message}</p>
              )}
            </div>
            <Controller
              control={form.control}
              name="valor"
              render={({ field, fieldState }) => (
                <CurrencyInput
                  label="Valor (R$) *"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={registrando}
                />
              )}
            />
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Controller control={form.control} name="categoria" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={registrando}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={registrando}>
              {registrando ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={registrando}
              onClick={() => { setFormAberto(false); form.reset() }}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
