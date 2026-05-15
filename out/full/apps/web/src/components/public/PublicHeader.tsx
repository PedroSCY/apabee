'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, Hexagon, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/loja', label: 'Loja' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

function CartIcon() {
  const count = useCartStore((s) => s.totalItems())
  const setOpen = useCartStore((s) => s.setDrawerOpen)

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setOpen(true)}
      aria-label="Carrinho de compras"
      className="relative"
    >
      <ShoppingCart />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Button>
  )
}

/** Cabeçalho público com navegação, carrinho e menu responsivo. */
export function PublicHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 container items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-honey-gradient shadow-soft">
            <Hexagon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-xl font-semibold text-accent">Apabee</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Apicultura Pratense
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-smooth',
                pathname === href || (href !== '/' && pathname?.startsWith(href))
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-accent hover:bg-secondary',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <CartIcon />
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/login">
              <LogIn /> Entrar
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <SheetClose asChild key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === href || (href !== '/' && pathname?.startsWith(href))
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-accent hover:bg-secondary',
                      )}
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="my-2 border-t border-border" />
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-sm font-semibold text-accent hover:bg-primary/10 transition-colors rounded-lg"
                  >
                    Entrar
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
