'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardShellProps {
  role: 'ADMIN' | 'ASSOCIADO'
  userName: string
  userEmail: string
  children: React.ReactNode
}

export function DashboardShell({ role, userName, userEmail, children }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header role={role} userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
