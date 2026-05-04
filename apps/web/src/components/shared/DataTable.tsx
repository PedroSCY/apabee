'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from './EmptyState'
import { TableSkeleton } from './LoadingSkeleton'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

const DEFAULT_PAGE_SIZE = 10

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  searchKeys = [],
  pageSize = DEFAULT_PAGE_SIZE,
  emptyTitle = 'Nenhum resultado',
  emptyDescription,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    if (!searchable || !query.trim()) return data
    const q = query.toLowerCase()
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
    )
  }, [data, query, searchable, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function getValue(row: T, col: Column<T>): React.ReactNode {
    if (col.render) return col.render(row)
    return String((row as Record<string, unknown>)[col.key] ?? '')
  }

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={columns.length} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left font-medium text-xs uppercase tracking-wide',
                      col.className,
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="py-12"
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="border-t border-border hover:bg-muted/20 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3', col.className)}>
                        {getValue(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
