'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Check, X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState, ConfirmDialog, CurrencyInput } from '@/components/shared'
import {
  useCotas,
  useRegistrarCota,
  useConfirmarCota,
  useCancelarCota,
} from '@/hooks/useCampanhas'
import { useAssociados } from '@/hooks/useAssociados'
import type { StatusCampanha } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso: string) => format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })

const schema = z.object({
  associadoId: z.string().optional(),
  valor: z.number().positive('Valor deve ser positivo'),
})
type FormData = z.infer<typeof schema>

function RegistrarCotaDialog({ campanhaId, valorMinimo, valorMaximo, open, onOpenChange }: {
  campanhaId: string
  valorMinimo?: number
  valorMaximo?: number
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: registrar, isPending } = useRegistrarCota(campanhaId)

  const { handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await registrar({ associadoId: data.associadoId || undefined, valor: data.valor })
      toast.success('Cota registrada.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao registrar cota.')
    }
  }

  const rangeHint = [
    valorMinimo ? `Mínimo: ${fmt(valorMinimo)}` : '',
    valorMaximo ? `Máximo: ${fmt(valorMaximo)}` : '',
  ].filter(Boolean).join(' · ')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registrar Cota</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Associado <span className="text-muted-foreground text-xs">(deixe vazio para cota da APA)</span></Label>
            <Controller
              control={control}
              name="associadoId"
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="APA — Recurso Próprio" />
                  </SelectTrigger>
                  <SelectContent>
                    {associados.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Controller
              control={control}
              name="valor"
              render={({ field, fieldState }) => (
                <CurrencyInput
                  label="Valor *"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isPending}
                />
              )}
            />
            {rangeHint && (
              <p className="text-xs text-muted-foreground">{rangeHint}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Registrando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  campanhaId: string
  statusCampanha: StatusCampanha
  isAdmin: boolean
  valorMeta?: number
  valorMinimo?: number
  valorMaximo?: number
}

export function CotasTab({ campanhaId, statusCampanha, isAdmin, valorMeta, valorMinimo, valorMaximo }: Props) {
  const { data: cotas = [], isLoading } = useCotas(campanhaId)
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: confirmar, isPending: confirmando } = useConfirmarCota(campanhaId)
  const { mutateAsync: cancelar } = useCancelarCota(campanhaId)

  const [registrarOpen, setRegistrarOpen] = React.useState(false)
  const [cancelarCotaId, setCancelarCotaId] = React.useState<string | null>(null)

  const podeEditar = statusCampanha === 'PLANEJADA' || statusCampanha === 'ATIVA'
  const arrecadado = cotas.reduce((s, c) => s + c.valor, 0)
  const progressoPct = valorMeta ? Math.min((arrecadado / valorMeta) * 100, 100) : 0

  const associadoNome = (id?: string) =>
    id ? (associados.find(a => a.id === id)?.usuario.nome ?? id.slice(0, 8)) : 'APA — Recurso Próprio'

  async function handleConfirmar(cotaId: string) {
    try {
      await confirmar(cotaId)
      toast.success('Pagamento confirmado.')
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao confirmar pagamento.')
    }
  }

  async function handleCancelar(cotaId: string) {
    try {
      await cancelar(cotaId)
      toast.success('Cota cancelada.')
    } catch {
      toast.error('Erro ao cancelar cota.')
    }
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <div className="space-y-4">
      {valorMeta && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Arrecadado</span>
            <span className="font-medium">
              <span className="text-emerald-600">{fmt(arrecadado)}</span>
              <span className="text-muted-foreground"> / {fmt(valorMeta)}</span>
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressoPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{progressoPct.toFixed(1)}% da meta</p>
        </div>
      )}

      {cotas.length === 0 ? (
        <EmptyState
          title="Nenhuma cota registrada"
          description="Registre cotas dos associados para esta campanha de aquisição."
          className="py-8"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Associado / Origem</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Confirmação</TableHead>
              {podeEditar && isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cotas.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <div>
                    {associadoNome(c.associadoId)}
                    {c.origem === 'RECURSO_PROPRIO' && (
                      <Badge variant="outline" className="ml-2 text-xs bg-slate-100 text-slate-600 border-transparent">APA</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{fmt(c.valor)}</TableCell>
                <TableCell>
                  {c.pago ? (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-transparent">Pago</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-transparent">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{fmtDate(c.dataRegistro)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.dataConfirmacao ? fmtDate(c.dataConfirmacao) : '—'}
                </TableCell>
                {podeEditar && isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!c.pago && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-600"
                          title="Confirmar pagamento"
                          onClick={() => void handleConfirmar(c.id)}
                          disabled={confirmando}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {c.origem !== 'RECURSO_PROPRIO' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="Cancelar cota"
                          onClick={() => setCancelarCotaId(c.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {podeEditar && isAdmin && (
        <Button size="sm" variant="outline" onClick={() => setRegistrarOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Registrar Cota
        </Button>
      )}

      <RegistrarCotaDialog
        campanhaId={campanhaId}
        valorMinimo={valorMinimo}
        valorMaximo={valorMaximo}
        open={registrarOpen}
        onOpenChange={setRegistrarOpen}
      />

      <ConfirmDialog
        open={Boolean(cancelarCotaId)}
        onOpenChange={(o) => { if (!o) setCancelarCotaId(null) }}
        title="Cancelar cota?"
        description="Esta cota será removida. Se o pagamento já foi realizado, será necessário estornar manualmente."
        confirmLabel="Cancelar Cota"
        variant="destructive"
        onConfirm={() => cancelarCotaId ? handleCancelar(cancelarCotaId) : Promise.resolve()}
      />
    </div>
  )
}
