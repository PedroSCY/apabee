import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { FinanceiroAdmin } from './_components/FinanceiroAdmin'
import { FinanceiroAssociado } from './_components/FinanceiroAssociado'

export default async function FinanceiroPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as string | undefined) ?? 'ASSOCIADO'

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Financeiro"
        description={
          role === 'ADMIN'
            ? 'Controle de mensalidades, movimentos e pagamentos da associação'
            : 'Suas mensalidades e histórico financeiro'
        }
      />
      {role === 'ADMIN' ? <FinanceiroAdmin /> : <FinanceiroAssociado />}
    </div>
  )
}
