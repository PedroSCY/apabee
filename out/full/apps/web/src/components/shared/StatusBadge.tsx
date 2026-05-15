import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

/** Mapa de classes de cor por status. @internal */
const STATUS_CLASS: Record<string, string> = {
  DISPONIVEL: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400',
  ATIVO: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400',
  CONFIRMADO: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400',
  FECHADO: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400',
  CONCLUIDO: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400',
  PUBLICADO: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400',
  EM_USO: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400',
  ABERTO: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400',
  PENDENTE: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400',
  MANUTENCAO: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400',
  SUSPENSO: 'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400',
  CANCELADO: 'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400',
  ARQUIVADO: 'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400',
}

/** Mapa de rótulos amigáveis por status. @internal */
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
  ARQUIVADO: 'Arquivado',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

/** Badge colorido que exibe um status com cor e rótulo padronizados. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABEL[status] ?? status
  const colorClass = STATUS_CLASS[status]

  return (
    <Badge
      variant={colorClass ? 'outline' : 'secondary'}
      className={cn(colorClass, className)}
    >
      {label}
    </Badge>
  )
}
