'use client'

import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart.store'
import type { ProdutoResponse } from '@/lib/api/catalogo'
import { Button } from '@/components/ui/button'

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
    <Button
      onClick={handleAdd}
      disabled={esgotado}
      className="w-full gap-2 rounded-xl py-3.5"
    >
      <ShoppingCart className="h-4 w-4" />
      {esgotado ? 'Produto Indisponível' : 'Adicionar ao Carrinho'}
    </Button>
  )
}
