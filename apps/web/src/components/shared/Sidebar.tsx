'use client'

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
  Hexagon,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/store/sidebar.store'

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
    items: [
      { label: 'Comunicação', href: '/comunicacao', icon: Megaphone },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ],
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
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarStore()
  const nav = role === 'ADMIN' ? ADMIN_NAV : ASSOCIADO_NAV

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-5 border-b border-sidebar-border overflow-hidden">
        <Hexagon className="h-6 w-6 text-sidebar-primary shrink-0" />
        {!collapsed && (
          <span className="font-bold text-[#7C4A00] text-lg leading-none whitespace-nowrap">
            Apabee
          </span>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-1.5 space-y-4">
        {nav.map((section, i) => (
          <div key={i} className="space-y-0.5">
            {section.group && !collapsed && (
              <p className="px-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
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
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md text-sm font-medium transition-colors',
                    collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Botão colapsar — fixo no canto inferior */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={toggle}
          className={cn(
            'flex items-center gap-2 w-full rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
