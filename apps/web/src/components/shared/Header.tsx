'use client'

import { useState, useTransition } from 'react'
import { Settings, LogOut, ShieldCheck, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlterarSenhaDialog } from './AlterarSenhaDialog'
import { NotificationBell } from './NotificationBell'

interface HeaderProps {
  role: 'ADMIN' | 'ASSOCIADO'
  userName: string
  userEmail: string
}

/** Barra superior com informações do usuário e ações rápidas. */
export function Header({ role, userName, userEmail }: HeaderProps) {
  const [isPending, startTransition] = useTransition()
  const [senhaDialogOpen, setSenhaDialogOpen] = useState(false)

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (userEmail[0]?.toUpperCase() ?? 'U')

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Apabee · {role === 'ADMIN' ? 'Painel Administrativo' : 'Painel do Associado'}
        </span>
        {role === 'ADMIN' && (
          <Badge variant="outline" className="ml-2 gap-1 border-accent/40 text-accent">
            <ShieldCheck className="h-3 w-3" /> Admin
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar size="default">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:grid flex-1 text-left text-sm leading-tight max-w-32">
                <span className=" truncate font-medium text-accent">{userName || role}</span>
                <span className=" truncate text-xs">{userEmail}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {role === 'ADMIN' && (
              <DropdownMenuItem asChild>
                <Link href="/configuracoes">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setSenhaDialogOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Alterar senha
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={isPending}
              className="focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {isPending ? 'Saindo…' : 'Sair'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlterarSenhaDialog open={senhaDialogOpen} onOpenChange={setSenhaDialogOpen} />
    </header>
  )
}
