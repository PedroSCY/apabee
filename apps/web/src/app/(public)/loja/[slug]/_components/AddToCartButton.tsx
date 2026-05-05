'use client'

import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart.store'
import type { ProdutoResponse } from '@/lib/api/catalogo'

interface Props {
  produto: ProdutoResponse
  esgotado: boolean
}

export function AddToCartButton({ produto, esgotado }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)

  function handleAdd() {
    addItem({
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: produto.imagemUrl,
    })
    toast.success('Produto adicionado ao carrinho.')
    setDrawerOpen(true)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={esgotado}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <ShoppingCart className="h-4 w-4" />
      {esgotado ? 'Produto Indisponível' : 'Adicionar ao Carrinho'}
    </button>
  )
}
