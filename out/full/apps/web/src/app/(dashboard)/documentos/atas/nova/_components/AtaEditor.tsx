'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCriarAta } from '@/hooks/useGestao'
import { useAssociados } from '@/hooks/useAssociados'

const DRAFT_KEY = 'apabee:rascunho_ata'

interface DraftData {
  titulo: string
  dataReuniao: string
  conteudo: string
  participantesIds: string[]
}

function readDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as DraftData) : null
  } catch {
    return null
  }
}

function writeDraft(data: DraftData) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export function AtaEditor() {
  const router = useRouter()
  const { mutateAsync: criarAta, isPending } = useCriarAta()
  const { data: associados = [] } = useAssociados()

  const [titulo, setTitulo] = React.useState('')
  const [dataReuniao, setDataReuniao] = React.useState('')
  const [conteudo, setConteudo] = React.useState('')
  const [participantesIds, setParticipantesIds] = React.useState<string[]>([])

  const [draftBanner, setDraftBanner] = React.useState(false)
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = React.useRef(false)

  // Check for existing draft on first mount
  React.useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const draft = readDraft()
    if (draft) setDraftBanner(true)
  }, [])

  // Auto-save debounce on every field change
  React.useEffect(() => {
    if (!initializedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      writeDraft({ titulo, dataReuniao, conteudo, participantesIds })
      setSavedAt(new Date())
    }, 2000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [titulo, dataReuniao, conteudo, participantesIds])

  function loadDraft() {
    const draft = readDraft()
    if (!draft) return
    setTitulo(draft.titulo)
    setDataReuniao(draft.dataReuniao)
    setConteudo(draft.conteudo)
    setParticipantesIds(draft.participantesIds)
    setDraftBanner(false)
  }

  function discardDraft() {
    clearDraft()
    setDraftBanner(false)
  }

  function toggleParticipante(id: string) {
    setParticipantesIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  function removeParticipante(id: string) {
    setParticipantesIds((prev) => prev.filter((p) => p !== id))
  }

  async function handleSalvar() {
    if (!titulo.trim()) { toast.error('Informe o título da ata.'); return }
    if (!dataReuniao) { toast.error('Informe a data da reunião.'); return }
    if (!conteudo.trim()) { toast.error('O conteúdo da ata não pode estar vazio.'); return }

    try {
      await criarAta({ titulo: titulo.trim(), conteudo, dataReuniao, participantesIds })
      clearDraft()
      toast.success('Ata salva com sucesso!')
      router.push('/documentos')
    } catch (err) {
      toast.error((err as Error).message ?? 'Erro ao salvar ata.')
    }
  }

  const nomeAssociado = (id: string) =>
    associados.find((a) => a.id === id)?.usuario.nome ?? id

  const participantesDisponiveis = associados.filter(
    (a) => !participantesIds.includes(a.id),
  )

  return (
    <div className="space-y-6">
      {/* Draft banner */}
      {draftBanner && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Você tem um rascunho salvo
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Deseja continuar de onde parou ou começar do zero?
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={discardDraft} className="h-8 text-xs">
              Descartar
            </Button>
            <Button size="sm" onClick={loadDraft} className="h-8 text-xs">
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Reunião Ordinária — Maio/2026"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dataReuniao">Data da Reunião *</Label>
          <Input
            id="dataReuniao"
            type="date"
            value={dataReuniao}
            onChange={(e) => setDataReuniao(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Participantes</Label>
          <Select
            value=""
            onValueChange={(id) => { if (id) toggleParticipante(id) }}
            disabled={isPending || participantesDisponiveis.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Adicionar participante…" />
            </SelectTrigger>
            <SelectContent>
              {participantesDisponiveis.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.usuario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {participantesIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {participantesIds.map((id) => (
                <Badge key={id} variant="secondary" className="gap-1 pr-1">
                  {nomeAssociado(id)}
                  <button
                    onClick={() => removeParticipante(id)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    disabled={isPending}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="conteudo">Conteúdo / Pauta *</Label>
        <Textarea
          id="conteudo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={14}
          placeholder="Descreva os assuntos tratados, deliberações e encaminhamentos…"
          disabled={isPending}
          className="resize-y font-mono text-sm"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {savedAt && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Rascunho salvo às {savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => router.push('/documentos')}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar Ata'}
          </Button>
        </div>
      </div>
    </div>
  )
}
