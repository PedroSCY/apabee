import { Skeleton } from '@/components/ui/skeleton'

export { Skeleton }

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

/** Esqueleto de carregamento para tabelas com linhas e colunas configuráveis. */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-4 pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2 border-t border-border">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ))}
    </div>
  )
}
