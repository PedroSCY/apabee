import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        muted: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'muted' },
  },
)

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'muted'

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  DISPONIVEL: 'success',
  ATIVO: 'success',
  CONFIRMADO: 'success',
  FECHADO: 'success',
  CONCLUIDO: 'success',
  EM_USO: 'info',
  ABERTO: 'info',
  PENDENTE: 'warning',
  MANUTENCAO: 'warning',
  DEVOLVIDO: 'muted',
  INATIVO: 'muted',
  RASCUNHO: 'muted',
  ESGOTADO: 'muted',
  SUSPENSO: 'error',
  CANCELADO: 'error',
  PUBLICADO: 'success',
}

const STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  EM_USO: 'Em uso',
  MANUTENCAO: 'Manutenção',
  ATIVO: 'Ativo',
  DEVOLVIDO: 'Devolvido',
  PENDENTE: 'Pendente',
  SUSPENSO: 'Suspenso',
  INATIVO: 'Inativo',
  ABERTO: 'Aberto',
  FECHADO: 'Fechado',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  ANTECIPACAO: 'Antecipação',
  PUBLICADO: 'Publicado',
  RASCUNHO: 'Rascunho',
  ESGOTADO: 'Esgotado',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT[status] ?? 'muted'
  const label = STATUS_LABEL[status] ?? status
  return <span className={cn(badgeVariants({ variant }), className)}>{label}</span>
}
