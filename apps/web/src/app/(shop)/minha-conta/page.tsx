'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, MapPin, Package, Plus, Star, Trash2 } from 'lucide-react'
import { buscarCep, formatCep } from '@/lib/cep'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useClienteLoja,
  useAtualizarCliente,
  useEnderecosCliente,
  useCriarEndereco,
  useRemoverEndereco,
  useDefinirEnderecoPrincipal,
  useMeusPedidosLoja,
} from '@/hooks/useLoja'
import type { CriarEnderecoInput } from '@/lib/api/loja'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando pagamento', className: 'bg-amber-100 text-amber-700 border-amber-300' },
  PAGO:                 { label: 'Pago',                 className: 'bg-blue-100 text-blue-700 border-blue-300' },
  EM_PREPARACAO:        { label: 'Em preparação',        className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  SAIU_ENTREGA:         { label: 'Saiu para entrega',    className: 'bg-purple-100 text-purple-700 border-purple-300' },
  ENTREGUE:             { label: 'Entregue',             className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  CANCELADO:            { label: 'Cancelado',            className: 'bg-red-100 text-red-700 border-red-300' },
}

const ENTREGA_LABEL: Record<string, string> = {
  PRATA_GRATIS:   'Entrega em Prata - PB',
  RETIRADA_LOCAL: 'Retirada local',
  A_COMBINAR:     'A combinar',
  CORREIOS:       'Correios',
}

// ─── Tab: Endereços ───────────────────────────────────────────────────────────

function NovoEnderecoForm({ onCancel }: { onCancel: () => void }) {
  const criar = useCriarEndereco()
  const [cepLoading, setCepLoading] = useState(false)
  const [form, setForm] = useState<CriarEnderecoInput>({
    apelido: '', logradouro: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '', cep: '',
  })

  function set(key: keyof CriarEnderecoInput, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw)
    set('cep', formatted)
    const clean = raw.replace(/\D/g, '')
    if (clean.length === 8) {
      setCepLoading(true)
      const data = await buscarCep(clean)
      setCepLoading(false)
      if (data) {
        setForm((f) => ({
          ...f,
          cep: formatted,
          logradouro: data.logradouro || f.logradouro,
          bairro: data.bairro || f.bairro,
          cidade: data.cidade || f.cidade,
          estado: data.estado || f.estado,
        }))
      }
    }
  }

  async function handleSave() {
    if (!form.apelido || !form.logradouro || !form.numero || !form.bairro || !form.cidade || !form.estado || !form.cep) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    await criar.mutateAsync(form)
    toast.success('Endereço salvo.')
    onCancel()
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="pt-5 grid grid-cols-1 gap-3">
        {/* Apelido + CEP (com auto-fill) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Apelido *</Label>
            <Input
              placeholder="Casa, Trabalho..."
              value={form.apelido}
              onChange={(e) => set('apelido', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>CEP *</Label>
            <div className="relative mt-1">
              <Input
                placeholder="00000-000"
                value={form.cep}
                maxLength={9}
                onChange={(e) => handleCepChange(e.target.value)}
              />
              {cepLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Logradouro (auto-preenchido) + Número */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label>Logradouro *</Label>
            <Input
              value={form.logradouro}
              onChange={(e) => set('logradouro', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Número *</Label>
            <Input
              value={form.numero}
              onChange={(e) => set('numero', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Complemento</Label>
          <Input
            value={form.complemento}
            onChange={(e) => set('complemento', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Bairro, Cidade, UF — auto-preenchidos via CEP */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Bairro *</Label>
            <Input
              value={form.bairro}
              onChange={(e) => set('bairro', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Cidade *</Label>
            <Input
              value={form.cidade}
              onChange={(e) => set('cidade', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>UF *</Label>
            <Input
              maxLength={2}
              value={form.estado}
              onChange={(e) => set('estado', e.target.value.toUpperCase())}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} disabled={criar.isPending || cepLoading} className="flex-1">
            {criar.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EnderecosTab() {
  const { data: enderecos, isLoading } = useEnderecosCliente()
  const remover = useRemoverEndereco()
  const definirPrincipal = useDefinirEnderecoPrincipal()
  const [mostrarForm, setMostrarForm] = useState(false)

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Endereços de entrega salvos</p>
        {!mostrarForm && (
          <Button size="sm" onClick={() => setMostrarForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        )}
      </div>

      {mostrarForm && <NovoEnderecoForm onCancel={() => setMostrarForm(false)} />}

      {!enderecos?.length && !mostrarForm && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum endereço cadastrado.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {enderecos?.map((e) => (
          <Card key={e.id} className={e.principal ? 'border-primary/40' : ''}>
            <CardContent className="pt-4 flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{e.apelido}</span>
                  {e.principal && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      Principal
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {e.logradouro}, {e.numero}{e.complemento ? `, ${e.complemento}` : ''} — {e.bairro}, {e.cidade}/{e.estado} — CEP {e.cep}
                </p>
              </div>
              <div className="flex gap-1">
                {!e.principal && (
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7"
                    title="Definir como principal"
                    onClick={() => definirPrincipal.mutate(e.id)}
                    disabled={definirPrincipal.isPending}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="icon" variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  title="Remover"
                  onClick={() => { if (confirm('Remover este endereço?')) remover.mutate(e.id) }}
                  disabled={remover.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Pedidos ─────────────────────────────────────────────────────────────

function PedidosTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMeusPedidosLoja(page)

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Carregando...</div>

  const pedidos = data?.pedidos ?? []
  const totalPages = data ? Math.ceil(data.total / 10) : 1

  if (!pedidos.length) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum pedido encontrado.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {pedidos.map((p) => {
          const cfg = STATUS_CONFIG[p.status] ?? { label: p.status, className: '' }
          return (
            <Card key={p.id}>
              <CardContent className="pt-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">#{p.id.slice(0, 8)}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.className}`}>
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold mt-1">{fmt(p.valorTotal)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ENTREGA_LABEL[p.opcaoEntrega] ?? p.opcaoEntrega} · {fmtDate(p.criadoEm)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/minha-conta/pedidos/${p.id}`}>Ver</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground self-center">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

function MinhaContaContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') ?? 'perfil'

  const { data: cliente, isLoading } = useClienteLoja()
  const atualizar = useAtualizarCliente()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>
  if (!cliente) return null

  const initials = (cliente.nome || cliente.email || '?')
    .split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  async function salvar() {
    await atualizar.mutateAsync({ nome: nome || cliente!.nome, telefone: telefone || undefined })
    toast.success('Dados atualizados.')
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold font-serif text-accent">Minha Conta</h1>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="enderecos">Endereços</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>

        {/* ── Perfil ── */}
        <TabsContent value="perfil" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {cliente.fotoUrl && <AvatarImage src={cliente.fotoUrl} alt={cliente.nome} />}
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{cliente.nome}</p>
                  <p className="text-sm text-muted-foreground">{cliente.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Nome</Label>
                  <Input
                    defaultValue={cliente.nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    defaultValue={cliente.telefone ?? ''}
                    placeholder="(xx) xxxxx-xxxx"
                    onChange={(e) => setTelefone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input value={cliente.email} disabled className="mt-1 opacity-60" />
                  <p className="text-xs text-muted-foreground mt-1">
                    E-mail vinculado ao Google, não editável.
                  </p>
                </div>
              </div>

              <Button onClick={salvar} disabled={atualizar.isPending}>
                {atualizar.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Endereços ── */}
        <TabsContent value="enderecos" className="mt-4">
          <EnderecosTab />
        </TabsContent>

        {/* ── Pedidos ── */}
        <TabsContent value="pedidos" className="mt-4">
          <PedidosTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function MinhaContaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Carregando...</div>}>
      <MinhaContaContent />
    </Suspense>
  )
}
