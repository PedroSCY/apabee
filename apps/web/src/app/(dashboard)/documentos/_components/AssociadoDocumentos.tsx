'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useDocumentos, useAtas } from '@/hooks/useGestao'
import { EmptyState, DataTable, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { DocumentoResponse, AtaResponse } from '@/lib/api/gestao'

const CATEGORIA_LABEL: Record<string, string> = {
  ATA: 'Ata',
  FINANCEIRO: 'Financeiro',
  PRESTACAO_CONTAS: 'Prestação de Contas',
  RELATORIO: 'Relatório',
  OUTRO: 'Outro',
}

function DocumentosTab() {
  const { data: documentos = [], isLoading } = useDocumentos()

  const cols: Column<DocumentoResponse>[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'categoria', label: 'Categoria', render: (r) => CATEGORIA_LABEL[r.categoria] ?? r.categoria },
    { key: 'tamanhoBytes', label: 'Tamanho', render: (r) => `${(r.tamanhoBytes / 1024).toFixed(0)} KB` },
    { key: 'criadoEm', label: 'Data', render: (r) => format(new Date(r.criadoEm), 'dd/MM/yyyy', { locale: ptBR }) },
    {
      key: 'acoes', label: '', className: 'w-32 text-right',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => window.open(r.arquivoUrl, '_blank')}>
          Abrir / Baixar
        </Button>
      ),
    },
  ]

  return (
    <DataTable
      data={documentos} columns={cols} rowKey={(r) => r.id}
      isLoading={isLoading}
      searchable searchPlaceholder="Buscar por título ou categoria…" searchKeys={['titulo', 'categoria']}
      emptyTitle="Nenhum documento publicado"
      emptyDescription="Ainda não há documentos disponíveis para visualização."
    />
  )
}

function AtasTab() {
  const { data: atas = [], isLoading } = useAtas()
  const publicadas = atas.filter((a) => a.publicada)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const cols: Column<AtaResponse>[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'dataReuniao', label: 'Data da Reunião', render: (r) => format(new Date(r.dataReuniao), 'dd/MM/yyyy', { locale: ptBR }) },
    {
      key: 'acoes', label: '', className: 'w-32 text-right',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
          {expandedId === r.id ? 'Fechar' : 'Ler'}
        </Button>
      ),
    },
  ]

  const ataExpandida = publicadas.find((a) => a.id === expandedId)

  return (
    <div className="space-y-4">
      {!isLoading && publicadas.length === 0 ? (
        <EmptyState title="Nenhuma ata publicada" description="Ainda não há atas disponíveis." />
      ) : (
        <>
          <DataTable data={publicadas} columns={cols} rowKey={(r) => r.id} isLoading={isLoading} />
          {ataExpandida && (
            <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-2">
              <p className="text-sm font-semibold">{ataExpandida.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(ataExpandida.dataReuniao), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm whitespace-pre-wrap mt-2">{ataExpandida.conteudo}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function AssociadoDocumentos() {
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
