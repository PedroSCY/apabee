'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Save, Building2, Palette, RefreshCw, Wallet } from 'lucide-react'
import { useConfiguracao, useAtualizarConfiguracao } from '@/hooks/useGestao'
import { useTemaStore } from '@/store/tema.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AtualizarConfiguracaoInput } from '@/lib/api/gestao'
import type { ConfiguracaoTema } from '@/store/tema.store'

// Valores padrão que espelham globals.css :root — exibidos quando o banco não tem tema personalizado.
const DEFAULTS = {
  corFundo:              '#faf9f7',
  corTexto:              '#292016',
  corPrimaria:           '#e68a0f',
  corPrimariaForeground: '#fdf9f6',
  corSidebar:            '#f8f5f2',
  corAccent:             '#723a1d',
} as const

interface ColorFieldProps {
  id: string
  label: string
  description: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ id, label, description, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="font-mono text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

/** Mini-preview que usa inline styles para mostrar o resultado antes de salvar. */
function ThemePreview({ cores }: { cores: ConfiguracaoTema }) {
  return (
    <div
      className="overflow-hidden rounded-lg border text-xs"
      style={{ background: cores.corFundo, color: cores.corTexto, borderColor: '#e5ddd5' }}
    >
      <div className="flex h-24">
        {/* Sidebar strip */}
        <div
          className="flex w-20 flex-col gap-1 p-2"
          style={{ background: cores.corSidebar, borderRight: '1px solid #e5ddd5' }}
        >
          <div className="h-1.5 w-10 rounded-full opacity-50" style={{ background: cores.corTexto }} />
          <div
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: cores.corPrimaria, color: cores.corPrimariaForeground }}
          >
            Ativo
          </div>
          <div className="h-1.5 w-8 rounded-full opacity-30" style={{ background: cores.corTexto }} />
          <div className="h-1.5 w-10 rounded-full opacity-30" style={{ background: cores.corTexto }} />
        </div>
        {/* Content area */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div className="space-y-1.5">
            <div className="h-2 w-24 rounded-full opacity-60" style={{ background: cores.corTexto }} />
            <div className="h-1.5 w-32 rounded-full opacity-30" style={{ background: cores.corTexto }} />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded px-2 py-1 text-[10px] font-semibold"
              style={{ background: cores.corPrimaria, color: cores.corPrimariaForeground }}
            >
              Salvar
            </button>
            <span
              className="rounded px-2 py-1 text-[10px]"
              style={{ background: cores.corAccent + '22', color: cores.corAccent }}
            >
              Destaque
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConfiguracoesClient() {
  const { data: config, isLoading } = useConfiguracao()
  const { mutateAsync: atualizar, isPending } = useAtualizarConfiguracao()
  const setConfiguracao = useTemaStore((s) => s.setConfiguracao)

  const [form, setForm] = React.useState<AtualizarConfiguracaoInput>({})

  React.useEffect(() => {
    if (!config) return
    setForm({
      nomeExibido: config.nomeExibido,
      cnpj: config.cnpj ?? '',
      email: config.email ?? '',
      telefone: config.telefone ?? '',
      endereco: config.endereco ?? '',
      // || em vez de ?? para tratar string vazia "" da mesma forma que null/undefined.
      corFundo:              config.corFundo              || DEFAULTS.corFundo,
      corTexto:              config.corTexto              || DEFAULTS.corTexto,
      corPrimaria:           config.corPrimaria           || DEFAULTS.corPrimaria,
      corPrimariaForeground: config.corPrimariaForeground || DEFAULTS.corPrimariaForeground,
      corSidebar:            config.corSidebar            || DEFAULTS.corSidebar,
      corAccent:             config.corAccent             || DEFAULTS.corAccent,
      valorMensalidade: config.valorMensalidade,
      diaVencimento: config.diaVencimento,
    })
  }, [config])

  function set<K extends keyof AtualizarConfiguracaoInput>(key: K, value: AtualizarConfiguracaoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setCor(key: keyof typeof DEFAULTS, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Live preview: aplica imediatamente na store para o ThemeProvider refletir no layout.
    setConfiguracao({
      corFundo:              form.corFundo              || DEFAULTS.corFundo,
      corTexto:              form.corTexto              || DEFAULTS.corTexto,
      corPrimaria:           form.corPrimaria           || DEFAULTS.corPrimaria,
      corPrimariaForeground: form.corPrimariaForeground || DEFAULTS.corPrimariaForeground,
      corSidebar:            form.corSidebar            || DEFAULTS.corSidebar,
      corAccent:             form.corAccent             || DEFAULTS.corAccent,
      [key]: value,
    })
  }

  async function handleSave() {
    try {
      const updated = await atualizar(form)
      toast.success('Configurações salvas.')
      // Sempre atualiza a store — independente de quais campos foram preenchidos.
      setConfiguracao({
        corFundo:              updated.corFundo              || DEFAULTS.corFundo,
        corTexto:              updated.corTexto              || DEFAULTS.corTexto,
        corPrimaria:           updated.corPrimaria           || DEFAULTS.corPrimaria,
        corPrimariaForeground: updated.corPrimariaForeground || DEFAULTS.corPrimariaForeground,
        corSidebar:            updated.corSidebar            || DEFAULTS.corSidebar,
        corAccent:             updated.corAccent             || DEFAULTS.corAccent,
      })
    } catch {
      toast.error('Erro ao salvar configurações.')
    }
  }

  function resetTheme() {
    setForm((prev) => ({ ...prev, ...DEFAULTS }))
    setConfiguracao(DEFAULTS)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="geral">
      <TabsList className="mb-6">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="aparencia">Aparência</TabsTrigger>
      </TabsList>

      {/* ── Tab: Geral ────────────────────────────────────────────────────── */}
      <TabsContent value="geral">
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Dados da Associação</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nomeExibido">Nome de exibição *</Label>
                <Input
                  id="nomeExibido"
                  value={form.nomeExibido ?? ''}
                  onChange={(e) => set('nomeExibido', e.target.value)}
                  placeholder="Apabee — APA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={form.cnpj ?? ''}
                    onChange={(e) => set('cnpj', e.target.value)}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={form.telefone ?? ''}
                    onChange={(e) => set('telefone', e.target.value)}
                    placeholder="(34) 99999-0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail institucional</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="contato@apa.org.br"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={form.endereco ?? ''}
                  onChange={(e) => set('endereco', e.target.value)}
                  placeholder="Rua das Flores, 123 — Prata, MG"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Mensalidades</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="valorMensalidade">Valor padrão (R$)</Label>
                <Input
                  id="valorMensalidade"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.valorMensalidade ?? ''}
                  onChange={(e) => set('valorMensalidade', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="30,00"
                />
                <p className="text-xs text-muted-foreground">Valor usado ao gerar mensalidades em lote.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="diaVencimento">Dia de vencimento</Label>
                <Input
                  id="diaVencimento"
                  type="number"
                  min={1}
                  max={28}
                  value={form.diaVencimento ?? ''}
                  onChange={(e) => set('diaVencimento', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">Dia do mês para vencimento (1–28).</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => void handleSave()} disabled={isPending}>
              <Save className="h-4 w-4 mr-1.5" />
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* ── Tab: Aparência ────────────────────────────────────────────────── */}
      <TabsContent value="aparencia">
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Personalização do Tema</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={resetTheme} className="text-xs text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Restaurar padrão
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview em tempo real */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Pré-visualização</p>
                <ThemePreview
                  cores={{
                    corFundo:              form.corFundo              || DEFAULTS.corFundo,
                    corTexto:              form.corTexto              || DEFAULTS.corTexto,
                    corPrimaria:           form.corPrimaria           || DEFAULTS.corPrimaria,
                    corPrimariaForeground: form.corPrimariaForeground || DEFAULTS.corPrimariaForeground,
                    corSidebar:            form.corSidebar            || DEFAULTS.corSidebar,
                    corAccent:             form.corAccent             || DEFAULTS.corAccent,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <ColorField
                  id="corFundo"
                  label="Cor de fundo"
                  description="Fundo principal da interface e cards"
                  value={form.corFundo || DEFAULTS.corFundo}
                  onChange={(v) => setCor('corFundo', v)}
                />
                <ColorField
                  id="corTexto"
                  label="Cor do texto"
                  description="Cor principal do texto"
                  value={form.corTexto || DEFAULTS.corTexto}
                  onChange={(v) => setCor('corTexto', v)}
                />
                <ColorField
                  id="corPrimaria"
                  label="Cor primária"
                  description="Botões, itens ativos da sidebar e focus ring"
                  value={form.corPrimaria || DEFAULTS.corPrimaria}
                  onChange={(v) => setCor('corPrimaria', v)}
                />
                <ColorField
                  id="corPrimariaForeground"
                  label="Texto sobre primária"
                  description="Texto sobre fundos de cor primária"
                  value={form.corPrimariaForeground || DEFAULTS.corPrimariaForeground}
                  onChange={(v) => setCor('corPrimariaForeground', v)}
                />
                <ColorField
                  id="corSidebar"
                  label="Cor do sidebar"
                  description="Fundo da barra de navegação lateral"
                  value={form.corSidebar || DEFAULTS.corSidebar}
                  onChange={(v) => setCor('corSidebar', v)}
                />
                <ColorField
                  id="corAccent"
                  label="Cor de destaque"
                  description="Elementos de ênfase secundária"
                  value={form.corAccent || DEFAULTS.corAccent}
                  onChange={(v) => setCor('corAccent', v)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => void handleSave()} disabled={isPending}>
              <Save className="h-4 w-4 mr-1.5" />
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
