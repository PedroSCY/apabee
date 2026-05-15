import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Target,
  ShoppingBag,
  Wallet,
  FileText,
  Settings,
  Megaphone,
  Sprout,
  type LucideIcon,
} from 'lucide-react'

/** Item individual de navegação com rótulo, rota e ícone. */
export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

/** Agrupamento de itens de navegação com um cabeçalho opcional. */
export type NavGroup = {
  group: string | null
  items: NavItem[]
}

/** Navegação completa do administrador. */
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
      { label: 'Produção', href: '/producao', icon: Layers },
      { label: 'Campanhas', href: '/campanhas', icon: Target },
      { label: 'Safras', href: '/safras', icon: Sprout },
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

/** Navegação reduzida do associado. */
export const ASSOCIADO_NAV: NavGroup[] = [
  {
    group: null,
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Insumos', href: '/insumos', icon: Package },
      { label: 'Produção', href: '/producao', icon: Layers },
      { label: 'Campanhas', href: '/campanhas', icon: Target },
      { label: 'Produtos', href: '/produtos', icon: ShoppingBag },
      { label: 'Documentos', href: '/documentos', icon: FileText },
    ],
  },
]

/** Retorna a navegação adequada de acordo com a role do usuário. */
export function getNavByRole(role: 'ADMIN' | 'ASSOCIADO'): NavGroup[] {
  return role === 'ADMIN' ? ADMIN_NAV : ASSOCIADO_NAV
}
