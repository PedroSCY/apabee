import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/shared/DashboardShell'
import { ThemeBootstrap } from '@/components/theme/ThemeBootstrap'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as 'ADMIN' | 'ASSOCIADO') ?? 'ASSOCIADO'
  const userName = (user.user_metadata?.nome as string | undefined) ?? ''
  const userEmail = user.email ?? ''

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  return (
    <>
      <ThemeBootstrap />
      <DashboardShell
        role={role}
        userName={userName}
        userEmail={userEmail}
        defaultOpen={defaultOpen}
      >
        {children}
      </DashboardShell>
    </>
  )
}
