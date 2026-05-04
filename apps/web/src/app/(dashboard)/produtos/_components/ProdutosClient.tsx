'use client'

import * as React from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProdutoCard, type ProdutoMock } from './ProdutoCard'

const MOCK_PRODUTOS: ProdutoMock[] = [
  { id: '1', nome: 'Mel Silvestre 500g', categoria: 'Mel', preco: 28.0, estoque: 24, status: 'DISPONIVEL' },
  { id: '2', nome: 'Mel Silvestre 250g', categoria: 'Mel', preco: 16.0, estoque: 38, status: 'DISPONIVEL' },
  { id: '3', nome: 'Mel Orgânico 1kg', categoria: 'Mel', preco: 52.0, estoque: 3, status: 'DISPONIVEL' },
  { id: '4', nome: 'Própolis Extrato 30ml', categoria: 'Própolis', preco: 35.0, estoque: 12, status: 'DISPONIVEL' },
  { id: '5', nome: 'Própolis Cápsula 60un', categoria: 'Própolis', preco: 45.0, estoque: 0, status: 'ESGOTADO' },
  { id: '6', nome: 'Cera de Abelha 100g', categoria: 'Cera', preco: 18.0, estoque: 8, status: 'DISPONIVEL' },
  { id: '7', nome: 'Geleia Real Pura 10g', categoria: 'Geleia Real', preco: 65.0, estoque: 5, status: 'DISPONIVEL' },
  { id: '8', nome: 'Kit Mel Variedades', categoria: 'Kits', preco: 88.0, estoque: 0, status: 'INATIVO' },
]

const CATEGORIAS = ['Todos', ...Array.from(new Set(MOCK_PRODUTOS.map((p) => p.categoria)))]

interface Props {
  isAdmin: boolean
}

export function ProdutosClient({ isAdmin }: Props) {
  const [categoria, setCategoria] = React.useState('Todos')
  const [busca, setBusca] = React.useState('')

  const filtered = MOCK_PRODUTOS.filter((p) => {
    const matchCat = categoria === 'Todos' || p.categoria === categoria
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    return matchCat && matchBusca
  })

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8"
          />
        </div>
        {isAdmin && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Produto
          </Button>
        )}
      </div>

      {/* Filtros de categoria */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoria === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de produtos */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProdutoCard key={p.id} produto={p} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pt-2">
        Dados de demonstração — módulo catálogo será integrado à API na Fase 4.
      </p>
    </div>
  )
}
