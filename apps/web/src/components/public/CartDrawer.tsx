'use client'

import * as React from 'react'
import Link from 'next/link'
import { X, Trash2, ShoppingCart, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const open = useCartStore((s) => s.drawerOpen)
  const setOpen = useCartStore((s) => s.setDrawerOpen)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalPreco = useCartStore((s) => s.totalPreco)

  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-card shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-4.5 w-4.5" />
            Carrinho
            {items.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
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
                {/* Thumbnail */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
                  {item.imagemUrl ? (
                    <img
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

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.produtoId, item.quantidade - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-input hover:bg-accent transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => updateQty(item.produtoId, item.quantidade + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-input hover:bg-accent transition-colors"
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-base">{fmt(totalPreco())}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Entrega e pagamento combinados diretamente com a associação.
            </p>
            <button
              onClick={() => {
                clearCart()
                setOpen(false)
              }}
              className="w-full rounded-lg border border-destructive/40 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
            >
              Limpar Carrinho
            </button>
            <Link
              href="/contato"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Finalizar Pedido via Contato
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
