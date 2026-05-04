import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { AssociadosClient } from './_components/AssociadosClient'

export default async function AssociadosPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | undefined
  if (role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Associados"
        description="Gerencie os membros da associação"
      />
      <AssociadosClient />
    </div>
  )
}
