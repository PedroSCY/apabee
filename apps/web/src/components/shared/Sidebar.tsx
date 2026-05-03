'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  ShoppingBag,
  Wallet,
  FileText,
  Settings,
  LogOut,
  Hexagon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'

type NavItem = { label: string; href: string; icon: React.ElementType }
type NavGroup = { group: string | null; items: NavItem[] }

const ADMIN_NAV: NavGroup[] = [
  {
    group: null,
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Gestão',
    items: [
      { label: 'Associados', href: '/associados', icon: Users },
      { label: 'Insumos', href: '/insumos', icon: Package },
      { label: 'Lotes', href: '/lotes', icon: Layers },
      { label: 'Produtos & Loja', href: '/produtos', icon: ShoppingBag },
    ],
  },
  {
    group: 'Financeiro',
    items: [
      { label: 'Financeiro', href: '/financeiro', icon: Wallet },
      { label: 'Documentos', href: '/documentos', icon: FileText },
    ],
  },
  {
    group: 'Sistema',
    items: [{ label: 'Configurações', href: '/configuracoes', icon: Settings }],
  },
]

const ASSOCIADO_NAV: NavGroup[] = [
  {
    group: null,
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Insumos', href: '/insumos', icon: Package },
      { label: 'Produção', href: '/producao', icon: Layers },
      { label: 'Produtos', href: '/produtos', icon: ShoppingBag },
      { label: 'Documentos', href: '/documentos', icon: FileText },
    ],
  },
]

interface SidebarProps {
  role: 'ADMIN' | 'ASSOCIADO'
  userEmail: string
}

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const nav = role === 'ADMIN' ? ADMIN_NAV : ASSOCIADO_NAV

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <Hexagon className="h-6 w-6 text-sidebar-primary" />
        <span className="font-bold text-[#7C4A00] text-lg leading-none">Apabee</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {nav.map((section, i) => (
          <div key={i} className="space-y-0.5">
            {section.group && (
              <p className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {section.group}
              </p>
            )}
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Rodapé do usuário */}
      <div className="border-t border-sidebar-border px-4 py-3 space-y-2">
        <p className="text-xs text-muted-foreground truncate" title={userEmail}>
          {userEmail}
        </p>
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {isPending ? 'Saindo...' : 'Sair'}
        </button>
      </div>
    </aside>
  )
}
