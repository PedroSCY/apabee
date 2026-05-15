'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardShellProps {
  role: 'ADMIN' | 'ASSOCIADO'
  userName: string
  userEmail: string
  defaultOpen?: boolean
  children: React.ReactNode
}

/** Layout principal do dashboard com sidebar e header. */
export function DashboardShell({
  role,
  userName,
  userEmail,
  defaultOpen = true,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar role={role} />
      <SidebarInset>
        <Header role={role} userName={userName} userEmail={userEmail} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
