import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { FinanceiroAdmin } from './_components/FinanceiroAdmin'

export default async function FinanceiroPage() {
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
        title="Financeiro"
        description="Controle de receitas, despesas, antecipações e repasses da associação"
      />
      <FinanceiroAdmin />
    </div>
  )
}
