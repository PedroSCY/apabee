'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Hexagon, ShieldCheck } from 'lucide-react'
import { getNavByRole } from '@/lib/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  role: 'ADMIN' | 'ASSOCIADO'
}

/** Navegação lateral com menu colapsável e itens por role. */
export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const nav = getNavByRole(role)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 px-1.5 py-3">
          <div className={cn("relative flex shrink-0 items-center justify-center rounded-lg", collapsed ? "": "bg-honey-gradient shadow-glow h-9 w-9")}>
            <Hexagon className={cn('h-5 w-5', collapsed ? 'text-primary' : 'text-primary-foreground')} strokeWidth={2.5} />
            {role === 'ADMIN' && (
              <ShieldCheck className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-accent p-0.5 text-accent-foreground" />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-serif text-base font-semibold text-accent leading-tight">Apabee</span>
              <span className="text-[11px] text-muted-foreground">
                {role === 'ADMIN' ? 'Administração' : 'Área do Associado'}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((section, i) => (
          <SidebarGroup key={i}>
            {section.group && (
              <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border" />
      <SidebarRail />
    </Sidebar>
  )
}
