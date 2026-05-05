'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Menu, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/store/sidebar.store'
import { signOut } from '@/lib/actions/auth'

// Mapa de rota → label do breadcrumb
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  associados: 'Associados',
  insumos: 'Insumos',
  lotes: 'Lotes',
  produtos: 'Produtos & Loja',
  producao: 'Produção',
  financeiro: 'Financeiro',
  documentos: 'Documentos',
  comunicacao: 'Comunicação',
  configuracoes: 'Configurações',
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, idx) => {
        const label = ROUTE_LABELS[seg] ?? seg
        const isLast = idx === segments.length - 1
        const href = '/' + segments.slice(0, idx + 1).join('/')
        return (
          <React.Fragment key={seg}>
            {idx > 0 && <span className="text-muted-foreground">/</span>}
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

interface HeaderProps {
  role: 'ADMIN' | 'ASSOCIADO'
  userName: string
  userEmail: string
}

export function Header({ role, userName, userEmail }: HeaderProps) {
  const { toggle } = useSidebarStore()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Fecha o dropdown ao clicar fora
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background shrink-0">
      {/* Esquerda: trigger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Alternar menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Breadcrumb />
      </div>

      {/* Direita: badge de role + user menu */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            role === 'ADMIN'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          )}
        >
          {role === 'ADMIN' ? 'Admin' : 'Associado'}
        </span>

        {/* Dropdown do usuário */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:block font-medium max-w-30 truncate">
              {userName || userEmail}
            </span>
            <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border border-border bg-background shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>

              {role === 'ADMIN' && (
                <Link
                  href="/configuracoes"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Configurações
                </Link>
              )}

              <button
                onClick={handleSignOut}
                disabled={isPending}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isPending ? 'Saindo…' : 'Sair'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
