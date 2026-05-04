'use client'

import { Package, MoreVertical } from 'lucide-react'
import { StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'

export interface ProdutoMock {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  status: 'DISPONIVEL' | 'ESGOTADO' | 'INATIVO'
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_ESTOQUE = (qtd: number) => {
  if (qtd === 0) return <span className="text-xs font-medium text-red-500">Esgotado</span>
  if (qtd <= 5) return <span className="text-xs font-medium text-amber-600">{qtd} em estoque</span>
  return <span className="text-xs font-medium text-emerald-600">{qtd} em estoque</span>
}

interface Props {
  produto: ProdutoMock
  isAdmin: boolean
}

export function ProdutoCard({ produto, isAdmin }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail placeholder */}
      <div className="flex h-40 items-center justify-center bg-muted/40">
        <Package className="h-10 w-10 text-muted-foreground/30" />
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold leading-snug">{produto.nome}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{produto.categoria}</p>
          </div>
          {isAdmin && (
            <button className="shrink-0 p-1 rounded-md text-muted-foreground hover:bg-accent transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-base font-bold">{fmt(produto.preco)}</p>
            {STATUS_ESTOQUE(produto.estoque)}
          </div>
          <StatusBadge status={produto.status} />
        </div>

        {!isAdmin && produto.status === 'DISPONIVEL' && (
          <Button size="sm" className="w-full mt-1" disabled={produto.estoque === 0}>
            {produto.estoque === 0 ? 'Indisponível' : 'Solicitar'}
          </Button>
        )}
      </div>
    </div>
  )
}
