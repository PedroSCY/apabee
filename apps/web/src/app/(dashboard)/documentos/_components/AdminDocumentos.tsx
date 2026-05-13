'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  useDocumentos,
  usePublicarDocumento,
  useDespublicarDocumento,
  useExcluirDocumento,
  useAtas,
  usePublicarAta,
  useDespublicarAta,
} from '@/hooks/useGestao'
import { DataTable, EmptyState, StatusBadge, ConfirmDialog, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { DocumentoResponse, AtaResponse } from '@/lib/api/gestao'
import { UploadDocumentoDialog } from './UploadDocumentoDialog'

const CATEGORIA_LABEL: Record<string, string> = {
  ATA: 'Ata',
  FINANCEIRO: 'Financeiro',
  PRESTACAO_CONTAS: 'Prestação de Contas',
  RELATORIO: 'Relatório',
  OUTRO: 'Outro',
}

function DocumentosTab() {
  const { data: documentos = [] } = useDocumentos()
  const { mutateAsync: publicar } = usePublicarDocumento()
  const { mutateAsync: despublicar } = useDespublicarDocumento()
  const { mutateAsync: excluir } = useExcluirDocumento()

  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [excluirConfirm, setExcluirConfirm] = React.useState<{ id: string; titulo: string } | null>(null)

  async function handleTogglePublicado(doc: DocumentoResponse) {
    try {
      if (doc.publicado) await despublicar(doc.id)
      else await publicar(doc.id)
      toast.success(doc.publicado ? 'Documento ocultado.' : 'Documento publicado.')
    } catch {
      toast.error('Erro ao alterar visibilidade.')
    }
  }

  async function handleExcluir() {
    if (!excluirConfirm) return
    try {
      await excluir(excluirConfirm.id)
      toast.success('Documento excluído.')
    } catch {
      toast.error('Erro ao excluir documento.')
    } finally {
      setExcluirConfirm(null)
    }
  }

  const cols: Column<DocumentoResponse>[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'categoria', label: 'Categoria', render: (r) => CATEGORIA_LABEL[r.categoria] ?? r.categoria },
    { key: 'tamanhoBytes', label: 'Tamanho', render: (r) => `${(r.tamanhoBytes / 1024).toFixed(0)} KB` },
    { key: 'criadoEm', label: 'Data', render: (r) => format(new Date(r.criadoEm), 'dd/MM/yyyy', { locale: ptBR }) },
    { key: 'publicado', label: 'Status', render: (r) => <StatusBadge status={r.publicado ? 'PUBLICADO' : 'RASCUNHO'} /> },
    {
      key: 'acoes', label: '', className: 'w-48 text-right',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => window.open(r.arquivoUrl, '_blank')}>Ver</Button>
          <Button variant="ghost" size="sm" onClick={() => handleTogglePublicado(r)}>
            {r.publicado ? 'Ocultar' : 'Publicar'}
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={() => setExcluirConfirm({ id: r.id, titulo: r.titulo })}>
            Excluir
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setUploadOpen(true)}>+ Novo Documento</Button>
      </div>

      {documentos.length === 0 ? (
        <EmptyState title="Nenhum documento" description="Faça upload do primeiro documento para a associação." />
      ) : (
        <DataTable data={documentos} columns={cols} rowKey={(r) => r.id}
          searchable searchPlaceholder="Buscar por título…" searchKeys={['titulo']} />
      )}

      <UploadDocumentoDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <ConfirmDialog
        open={excluirConfirm !== null}
        onOpenChange={(o) => { if (!o) setExcluirConfirm(null) }}
        title="Excluir Documento"
        description={`Tem certeza que deseja excluir "${excluirConfirm?.titulo}"? O arquivo será removido do storage.`}
        confirmLabel="Excluir" variant="destructive"
        onConfirm={handleExcluir} />
    </>
  )
}

function AtasTab() {
  const router = useRouter()
  const { data: atas = [] } = useAtas()
  const { mutateAsync: publicar } = usePublicarAta()
  const { mutateAsync: despublicar } = useDespublicarAta()
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  async function handleTogglePublicada(ata: AtaResponse) {
    try {
      if (ata.publicada) await despublicar(ata.id)
      else await publicar(ata.id)
      toast.success(ata.publicada ? 'Ata ocultada.' : 'Ata publicada.')
    } catch {
      toast.error('Erro ao alterar visibilidade da ata.')
    }
  }

  const cols: Column<AtaResponse>[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'dataReuniao', label: 'Data da Reunião', render: (r) => format(new Date(r.dataReuniao), 'dd/MM/yyyy', { locale: ptBR }) },
    { key: 'publicada', label: 'Status', render: (r) => <StatusBadge status={r.publicada ? 'PUBLICADO' : 'RASCUNHO'} /> },
    {
      key: 'acoes', label: '', className: 'w-48 text-right',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
            {expandedId === r.id ? 'Fechar' : 'Ver conteúdo'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleTogglePublicada(r)}>
            {r.publicada ? 'Ocultar' : 'Publicar'}
          </Button>
        </div>
      ),
    },
  ]

  const ataExpandida = atas.find((a) => a.id === expandedId)

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => router.push('/documentos/atas/nova')}>+ Nova Ata</Button>
      </div>

      {atas.length === 0 ? (
        <EmptyState title="Nenhuma ata" description="Crie a primeira ata de reunião." />
      ) : (
        <div className="space-y-4">
          <DataTable data={atas} columns={cols} rowKey={(r) => r.id}
            searchable searchPlaceholder="Buscar por título…" searchKeys={['titulo']} />
          {ataExpandida && (
            <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-2">
              <p className="text-sm font-medium">{ataExpandida.titulo}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ataExpandida.conteudo}</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export function AdminDocumentos() {
  return (
    <Tabs defaultValue="documentos">
      <TabsList className="mb-6">
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
        <TabsTrigger value="atas">Atas</TabsTrigger>
      </TabsList>
      <TabsContent value="documentos"><DocumentosTab /></TabsContent>
      <TabsContent value="atas"><AtasTab /></TabsContent>
    </Tabs>
  )
}
