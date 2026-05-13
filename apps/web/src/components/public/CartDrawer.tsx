'use client'

import Link from 'next/link'
import { Trash2, ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import Image from 'next/image'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const open = useCartStore((s) => s.drawerOpen)
  const setOpen = useCartStore((s) => s.setDrawerOpen)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalPreco = useCartStore((s) => s.totalPreco)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex flex-col w-full max-w-sm p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Carrinho
            {items.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {items.length}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium">Carrinho vazio</p>
              <p className="text-xs text-muted-foreground">
                Adicione produtos da nossa{' '}
                <Link
                  href="/loja"
                  onClick={() => setOpen(false)}
                  className="text-primary hover:underline underline-offset-4"
                >
                  loja
                </Link>
                .
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.produtoId} className="flex items-start gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
                  {item.imagemUrl ? (
                    <Image
                      src={item.imagemUrl}
                      alt={item.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-amber-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug truncate">{item.nome}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{fmt(item.preco)}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.produtoId, item.quantidade - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-input hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => updateQty(item.produtoId, item.quantidade + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-input hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.produtoId)}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-base">{fmt(totalPreco())}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Entrega e pagamento combinados diretamente com a associação.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/5"
              onClick={() => { clearCart(); setOpen(false) }}
            >
              Limpar Carrinho
            </Button>
            <Button className="w-full" asChild>
              <Link href="/contato" onClick={() => setOpen(false)}>
                Finalizar Pedido via Contato
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
