'use client'

import Link from 'next/link'
import { ArrowLeft, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared'
import { useAssociado, useAtivarUsuario, useDesativarUsuario } from '@/hooks/useAssociados'
import { DadosPessoaisTab } from './DadosPessoaisTab'
import { PatrimonioTab } from './PatrimonioTab'
import { ProducaoTab } from './ProducaoTab'
import { FinanceiroTab } from './FinanceiroTab'

interface Props {
  associadoId: string
}

export function AssociadoDetailClient({ associadoId }: Props) {
  const { data: associado, isLoading } = useAssociado(associadoId)
  const { mutateAsync: ativar, isPending: ativando } = useAtivarUsuario()
  const { mutateAsync: desativar, isPending: desativando } = useDesativarUsuario()

  const isAtivo = associado?.status === 'ATIVO'
  const isPending = ativando || desativando

  async function handleToggleStatus() {
    if (!associado) return
    try {
      if (isAtivo) {
        await desativar(associado.usuario.id)
        toast.success('Associado desativado.')
      } else {
        await ativar(associado.usuario.id)
        toast.success('Associado ativado.')
      }
    } catch {
      toast.error('Ocorreu um erro. Tente novamente.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
        <Link href="/associados">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Associados
        </Link>
      </Button>

      {isLoading ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      ) : associado ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl text-accent">{associado.usuario.nome}</h1>
              <StatusBadge status={associado.status} />
            </div>
            <p className="text-sm text-muted-foreground">{associado.usuario.email}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isPending}
            className={
              isAtivo
                ? 'text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30'
                : ''
            }
          >
            {isAtivo ? (
              <><UserX className="h-4 w-4" /> Desativar</>
            ) : (
              <><UserCheck className="h-4 w-4" /> Ativar</>
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Associado não encontrado.</p>
      )}

      {associado && (
        <Tabs defaultValue="dados">
          <TabsList>
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
            <TabsTrigger value="producao">Produção</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-4">
            <DadosPessoaisTab associado={associado} />
          </TabsContent>
          <TabsContent value="patrimonio" className="mt-4">
            <PatrimonioTab associadoId={associado.id} />
          </TabsContent>
          <TabsContent value="producao" className="mt-4">
            <ProducaoTab associadoId={associado.id} />
          </TabsContent>
          <TabsContent value="financeiro" className="mt-4">
            <FinanceiroTab associadoId={associado.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
