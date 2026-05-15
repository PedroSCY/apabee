import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { ConfiguracoesClient } from './_components/ConfiguracoesClient'

export default async function ConfiguracoesPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as string | undefined) ?? 'ASSOCIADO'
  if (role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados da associação e personalização visual do sistema"
      />
      <ConfiguracoesClient />
    </div>
  )
}
