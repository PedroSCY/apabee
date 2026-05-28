'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingCart, Minus, Plus, CreditCard } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import Image from 'next/image'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ShopAuthButton } from '../shop/ShopAuthButton'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Drawer lateral do carrinho de compras com lista de itens e total. */
export function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const open = useCartStore((s) => s.drawerOpen)
  const setOpen = useCartStore((s) => s.setDrawerOpen)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalPreco = useCartStore((s) => s.totalPreco)
  const [isCliente, setIsCliente] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsCliente(data.user?.app_metadata?.role === 'CLIENTE')
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsCliente((session?.user?.app_metadata?.role ?? null) === 'CLIENTE')
    })
    return () => listener.subscription.unsubscribe()
  }, [])

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
              <div key={item.produtoId} className="flex gap-3">
                {/* Imagem */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
                  {item.imagemUrl ? (
                    <Image
                      src={item.imagemUrl}
                      alt={item.nome}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-amber-300" />
                  )}
                </div>

                {/* Conteúdo — ocupa o espaço restante com layout em duas linhas */}
                <div className="flex flex-1 min-w-0 flex-col justify-between">
                  {/* Linha 1: nome + botão remover */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug truncate">{item.nome}</p>
                    <button
                      onClick={() => removeItem(item.produtoId)}
                      className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Remover item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Linha 2: preço + controles de quantidade */}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-bold text-primary">{fmt(item.preco)}</p>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.produtoId, item.quantidade - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-input hover:bg-secondary transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium tabular-nums">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => updateQty(item.produtoId, item.quantidade + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-input hover:bg-secondary transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-base">{fmt(totalPreco())}</span>
            </div>

            {isCliente ? (
              <Button
                className="w-full gap-2"
                onClick={() => { setOpen(false); router.push('/checkout') }}
              >
                <CreditCard className="h-4 w-4" /> Finalizar compra
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Faça login para finalizar sua compra
                </p>
                <ShopAuthButton
                  redirectTo="/checkout"
                  variant="default"
                  size="default"
                  label="Entrar com Google para comprar"
                  className="w-full"
                />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-destructive"
              onClick={() => { clearCart(); setOpen(false) }}
            >
              Limpar carrinho
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
