import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { ComunicacaoClient } from './_components/ComunicacaoClient'

export default async function ComunicacaoPage() {
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
        title="Comunicação"
        description="Gerencie avisos e comunicados para os associados da APA"
      />
      <ComunicacaoClient />
    </div>
  )
}
