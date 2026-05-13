import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  ShoppingBag,
  Wallet,
  FileText,
  Settings,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type NavGroup = {
  group: string | null
  items: NavItem[]
}

export const ADMIN_NAV: NavGroup[] = [
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

export const ASSOCIADO_NAV: NavGroup[] = [
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

export function getNavByRole(role: 'ADMIN' | 'ASSOCIADO'): NavGroup[] {
  return role === 'ADMIN' ? ADMIN_NAV : ASSOCIADO_NAV
}
