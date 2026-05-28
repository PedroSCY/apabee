'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Menu, Hexagon, User, Package, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShopAuthButton } from '../shop/ShopAuthButton'

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

interface UserInfo {
  nome: string
  email: string
  fotoUrl?: string
  role: string
}

function ClienteMenu({ user }: { user: UserInfo }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/loja')
    router.refresh()
  }

  const initials = user.nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0">
          <Avatar className="h-9 w-9">
            {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt={user.nome} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">{user.nome}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/minha-conta">
            <User className="h-4 w-4 mr-2" /> Minha Conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/minha-conta?tab=pedidos">
            <Package className="h-4 w-4 mr-2" /> Meus Pedidos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Cabeçalho público com navegação, carrinho e menu do cliente Google. */
export function PublicHeader() {
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { setUserInfo(null); return }

      const role = (data.user.app_metadata?.role as string | undefined) ?? ''

      // ADMIN e ASSOCIADO usam o header do dashboard — não mostrar aqui
      if (role === 'ADMIN' || role === 'ASSOCIADO') { setUserInfo(null); return }

      // CLIENTE ou sem role ainda (sync pendente) — mostrar avatar
      const meta = data.user.user_metadata
      setUserInfo({
        nome: (meta?.full_name ?? meta?.name ?? data.user.email) as string,
        email: data.user.email ?? '',
        fotoUrl: (meta?.avatar_url ?? meta?.picture) as string | undefined,
        role,
      })
    }

    void loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => void loadUser())
    return () => listener.subscription.unsubscribe()
  }, [])

  const isAssociadoLink = pathname?.startsWith('/dashboard') || pathname?.startsWith('/login')

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
          {userInfo ? (
            <ClienteMenu user={userInfo} />
          ) : isAssociadoLink ? null : (
            <div className="hidden md:flex">
              <ShopAuthButton variant="ghost" size="sm" label="Entrar" />
            </div>
          )}
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
                {userInfo ? (
                  <>
                    <SheetClose asChild>
                      <Link href="/minha-conta" className="block px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg">
                        Minha Conta
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/minha-conta?tab=pedidos" className="block px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg">
                        Meus Pedidos
                      </Link>
                    </SheetClose>
                  </>
                ) : (
                  <div className="px-3 pt-1 space-y-2">
                    <ShopAuthButton variant="outline" size="sm" label="Entrar com Google" />
                    <p className="text-xs text-muted-foreground text-center">
                      Já é associado?{' '}
                      <SheetClose asChild>
                        <Link href="/login" className="text-primary hover:underline font-medium">
                          Entrar aqui
                        </Link>
                      </SheetClose>
                    </p>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
