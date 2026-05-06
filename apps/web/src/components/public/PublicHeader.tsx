'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, Hexagon, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { Button } from '../ui/button'

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
      className="relative "
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

export function PublicHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
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
          ))}
          <div className="w-full border-b-2 border-accent-light/60 "></div>
          <Link
            href="/login"
            className="block  px-3 py-2 text-sm font-semibold text-accent hover:bg-primary/10 transition-colors"
          >
            Entrar
          </Link>
        </div>
      )}
    </header>
  )
}
