'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Save, Building2, Palette, RefreshCw } from 'lucide-react'
import { useConfiguracao, useAtualizarConfiguracao } from '@/hooks/useGestao'
import { useTemaStore } from '@/store/tema.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AtualizarConfiguracaoInput } from '@/lib/api/gestao'

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
      corFundo: config.corFundo ?? '',
      corTexto: config.corTexto ?? '',
      corPrimaria: config.corPrimaria ?? '',
      corPrimariaForeground: config.corPrimariaForeground ?? '',
      corSidebar: config.corSidebar ?? '',
      corAccent: config.corAccent ?? '',
    })
  }, [config])

  function set<K extends keyof AtualizarConfiguracaoInput>(key: K, value: AtualizarConfiguracaoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    try {
      const updated = await atualizar(form)
      toast.success('Configurações salvas.')
      if (
        updated.corFundo && updated.corTexto && updated.corPrimaria &&
        updated.corPrimariaForeground && updated.corSidebar && updated.corAccent
      ) {
        setConfiguracao({
          corFundo: updated.corFundo,
          corTexto: updated.corTexto,
          corPrimaria: updated.corPrimaria,
          corPrimariaForeground: updated.corPrimariaForeground,
          corSidebar: updated.corSidebar,
          corAccent: updated.corAccent,
        })
      }
    } catch {
      toast.error('Erro ao salvar configurações.')
    }
  }

  function resetTheme() {
    setForm((prev) => ({
      ...prev,
      corFundo: '',
      corTexto: '',
      corPrimaria: '',
      corPrimariaForeground: '',
      corSidebar: '',
      corAccent: '',
    }))
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
    <div className="space-y-6 max-w-2xl">
      {/* Dados da associação */}
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

      {/* Personalização do tema */}
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
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ColorField
            id="corFundo"
            label="Cor de fundo"
            description="Cor de fundo principal da interface"
            value={form.corFundo ?? ''}
            onChange={(v) => set('corFundo', v)}
          />
          <ColorField
            id="corTexto"
            label="Cor do texto"
            description="Cor principal do texto"
            value={form.corTexto ?? ''}
            onChange={(v) => set('corTexto', v)}
          />
          <ColorField
            id="corPrimaria"
            label="Cor primária"
            description="Botões, links e destaques"
            value={form.corPrimaria ?? ''}
            onChange={(v) => set('corPrimaria', v)}
          />
          <ColorField
            id="corPrimariaForeground"
            label="Texto sobre primária"
            description="Texto sobre fundos de cor primária"
            value={form.corPrimariaForeground ?? ''}
            onChange={(v) => set('corPrimariaForeground', v)}
          />
          <ColorField
            id="corSidebar"
            label="Cor do sidebar"
            description="Fundo da barra de navegação lateral"
            value={form.corSidebar ?? ''}
            onChange={(v) => set('corSidebar', v)}
          />
          <ColorField
            id="corAccent"
            label="Cor de destaque"
            description="Hover e estados de seleção"
            value={form.corAccent ?? ''}
            onChange={(v) => set('corAccent', v)}
          />
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end">
        <Button onClick={() => void handleSave()} disabled={isPending}>
          <Save className="h-4 w-4 mr-1.5" />
          {isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
