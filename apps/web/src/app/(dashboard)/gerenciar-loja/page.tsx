'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, Package, Search, Truck, Home, MessageSquare } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  useAdminPedidosLoja,
  useAdminClientes,
  useAdminConfiguracaoLoja,
  useAtualizarConfiguracaoLoja,
} from '@/hooks/useLoja'
import type { AtualizarConfiguracaoLojaInput, ClienteAdminResponse } from '@/lib/api/loja'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
const fmtRelative = (iso: string) =>
  formatDistanceToNow(new Date(iso), { locale: ptBR, addSuffix: true })

// ─── Configurações de status ─────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; cls: string; border: string }> = {
  AGUARDANDO_PAGAMENTO: {
    label: 'Aguardando',
    cls: 'bg-amber-100 text-amber-700 border-amber-300',
    border: 'border-l-amber-400',
  },
  PAGO: {
    label: 'Pago',
    cls: 'bg-blue-100 text-blue-700 border-blue-300',
    border: 'border-l-blue-500',
  },
  EM_PREPARACAO: {
    label: 'Em preparação',
    cls: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    border: 'border-l-indigo-500',
  },
  SAIU_ENTREGA: {
    label: 'Saiu entrega',
    cls: 'bg-purple-100 text-purple-700 border-purple-300',
    border: 'border-l-purple-500',
  },
  ENTREGUE: {
    label: 'Entregue',
    cls: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    border: 'border-l-emerald-500',
  },
  CANCELADO: {
    label: 'Cancelado',
    cls: 'bg-red-100 text-red-700 border-red-300',
    border: 'border-l-red-400',
  },
  CANCELAMENTO_SOLICITADO: {
    label: '⚠ Canc. solicitado',
    cls: 'bg-orange-100 text-orange-700 border-orange-300',
    border: 'border-l-orange-500',
  },
}

const ENTREGA_CFG: Record<string, { label: string; icon: React.ReactNode }> = {
  PRATA_GRATIS: { label: 'Entrega Prata', icon: <Truck className="h-3 w-3" /> },
  RETIRADA_LOCAL: { label: 'Retirada', icon: <Home className="h-3 w-3" /> },
  A_COMBINAR: { label: 'A combinar', icon: <MessageSquare className="h-3 w-3" /> },
  CORREIOS: { label: 'Correios', icon: <Package className="h-3 w-3" /> },
}

// ─── Inbox de cancelamentos ──────────────────────────────────────────────────

function CancelamentosInbox({ clienteMap, onVer }: {
  clienteMap: Map<string, ClienteAdminResponse>
  onVer: (id: string) => void
}) {
  const { data } = useAdminPedidosLoja({ status: 'CANCELAMENTO_SOLICITADO', limit: 50 })
  const pedidos = data?.pedidos ?? []
  if (pedidos.length === 0) return null

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-orange-200">
        <AlertCircle className="h-4 w-4 text-orange-600 shrink-0" />
        <p className="text-sm font-semibold text-orange-800 flex-1">
          Solicitações de cancelamento
        </p>
        <span className="text-xs font-bold bg-orange-200 text-orange-800 rounded-full px-2 py-0.5">
          {pedidos.length}
        </span>
      </div>

      {/* Lista */}
      <div className="divide-y divide-orange-100">
        {pedidos.map((p) => {
          const cli = clienteMap.get(p.clienteId)
          return (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-900 truncate">
                  {cli?.nome ?? '—'}
                </p>
                <p className="text-xs text-orange-700 truncate">
                  #{p.id.slice(0, 8)} · {fmt(p.valorTotal)} · {fmtRelative(p.criadoEm)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100 shrink-0 h-7 px-2 text-xs"
                onClick={() => onVer(p.id)}
              >
                Analisar →
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Aba de Pedidos ─────────────────────────────────────────────────────────

function PedidosTab() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [statusFiltro, setStatusFiltro] = useState('')
  const [busca, setBusca] = useState('')

  // Pedidos do fluxo normal — nunca inclui CANCELAMENTO_SOLICITADO
  const { data, isLoading } = useAdminPedidosLoja({ status: statusFiltro || undefined, page })
  const { data: clientes } = useAdminClientes()

  const clienteMap = new Map<string, ClienteAdminResponse>(
    (clientes ?? []).map((c) => [c.id, c])
  )

  // Exclui CANCELAMENTO_SOLICITADO da lista principal (tratado no inbox acima)
  const pedidosFiltrados = (data?.pedidos ?? []).filter((p) => {
    if (p.status === 'CANCELAMENTO_SOLICITADO') return false
    if (!busca) return true
    const cli = clienteMap.get(p.clienteId)
    if (!cli) return false
    const q = busca.toLowerCase()
    return cli.nome.toLowerCase().includes(q) || cli.email.toLowerCase().includes(q)
  })

  const pagosCount = (data?.pedidos ?? []).filter((p) => p.status === 'PAGO').length

  // 'todos' é sentinel interno — a API recebe string vazia (= sem filtro)
  function filtrarPor(status: string) {
    setStatusFiltro(status === 'todos' ? '' : status)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Inbox de cancelamentos — fila de decisão administrativa */}
      <CancelamentosInbox
        clienteMap={clienteMap}
        onVer={(id) => router.push(`/gerenciar-loja/pedidos/${id}`)}
      />

      {/* Banner de pedidos pagos aguardando preparação */}
      {pagosCount > 0 && (
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100 transition-colors"
          onClick={() => filtrarPor('PAGO')}
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-blue-700">
              {pagosCount === 1
                ? '1 pedido pago aguardando início da preparação.'
                : `${pagosCount} pedidos pagos aguardando início da preparação.`}
            </span>
          </span>
          <span className="text-xs font-medium text-blue-600 underline underline-offset-2 whitespace-nowrap shrink-0">
            Ver pedidos →
          </span>
        </button>
      )}

      {/* Busca + filtro de status em uma linha */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nome ou e-mail do cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={statusFiltro === '' ? 'todos' : statusFiltro} onValueChange={filtrarPor}>
          <SelectTrigger className="w-47.5 shrink-0">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</SelectItem>
            <SelectItem value="EM_PREPARACAO">Em preparação</SelectItem>
            <SelectItem value="SAIU_ENTREGA">Saiu para entrega</SelectItem>
            <SelectItem value="ENTREGUE">Entregue</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de pedidos */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum pedido encontrado.</p>
      ) : (
        <div className="space-y-2">
          {pedidosFiltrados.map((p) => {
            const s = STATUS_CFG[p.status] ?? { label: p.status, cls: '', border: 'border-l-gray-300' }
            const entrega = ENTREGA_CFG[p.opcaoEntrega]
            const cliente = clienteMap.get(p.clienteId)
            return (
              <Card
                key={p.id}
                className={`cursor-pointer hover:shadow-sm transition-shadow border-l-4 ${s.border}`}
                onClick={() => router.push(`/gerenciar-loja/pedidos/${p.id}`)}
              >
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Linha 1: número + status + tempo relativo */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">#{p.id.slice(0, 8)}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${s.cls}`}>{s.label}</Badge>
                      {entrega && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0">
                          {entrega.icon}
                          {entrega.label}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{fmtRelative(p.criadoEm)}</span>
                    </div>
                    {/* Linha 2: cliente */}
                    {cliente ? (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        <span className="font-medium text-foreground">{cliente.nome}</span>
                        {' · '}{cliente.email}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(p.criadoEm)}</p>
                    )}
                  </div>
                  <p className="font-bold text-sm text-primary shrink-0">{fmt(p.valorTotal)}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Paginação */}
      {data && Math.ceil(data.total / 20) > 1 && (
        <div className="flex items-center gap-2 justify-center">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground px-2">
            Página {page} de {Math.ceil(data.total / 20)}
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
        </div>
      )}
    </div>
  )
}

// ─── Aba de Clientes ─────────────────────────────────────────────────────────

function ClientesTab() {
  const [busca, setBusca] = useState('')
  // Lazy: só executa quando a aba Clientes está montada (Tabs renderiza sob demanda)
  const { data: clientes, isLoading } = useAdminClientes()

  const filtrados = clientes?.filter(
    (c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email.toLowerCase().includes(busca.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum cliente.</p>
      ) : (
        <div className="space-y-2">
          {filtrados.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-3 pb-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  {c.telefone && <p className="text-xs text-muted-foreground">{c.telefone}</p>}
                </div>
                <p className="text-xs text-muted-foreground shrink-0">{fmtDate(c.criadoEm)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Aba de Configurações ─────────────────────────────────────────────────────

function ConfigTab() {
  const { data: cfg, isLoading } = useAdminConfiguracaoLoja()
  const atualizar = useAtualizarConfiguracaoLoja()
  const [form, setForm] = useState<AtualizarConfiguracaoLojaInput>({})

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>
  if (!cfg) return null

  function val<K extends keyof AtualizarConfiguracaoLojaInput>(key: K): any {
    return key in form ? form[key] : (cfg as any)[key]
  }

  function set<K extends keyof AtualizarConfiguracaoLojaInput>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function salvar() {
    await atualizar.mutateAsync(form)
    setForm({})
    toast.success('Configurações salvas.')
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Entrega */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Entrega</h3>
        {[
          { key: 'ativaEntregaPrata', label: 'Entrega em Prata - PB (Grátis)' },
          { key: 'ativaRetiradaLocal', label: 'Retirada local' },
          { key: 'ativaACombinar', label: 'A combinar (outras cidades)' },
          { key: 'ativaCorreios', label: 'Correios (em breve)' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-sm">{label}</Label>
            <Switch
              checked={Boolean(val(key as any))}
              onCheckedChange={(v) => set(key as any, v)}
              disabled={key === 'ativaCorreios'}
            />
          </div>
        ))}
        <div>
          <Label className="text-sm">Endereço de retirada</Label>
          <Input className="mt-1" value={val('enderecoRetirada') ?? ''} onChange={(e) => set('enderecoRetirada', e.target.value)} />
        </div>
        <div>
          <Label className="text-sm">Horário de atendimento</Label>
          <Input className="mt-1" placeholder="Seg-Sex, 8h–17h" value={val('horarioAtendimento') ?? ''} onChange={(e) => set('horarioAtendimento', e.target.value)} />
        </div>
        <div>
          <Label className="text-sm">Contato para A combinar</Label>
          <Input className="mt-1" placeholder="WhatsApp ou e-mail" value={val('contatoEntrega') ?? ''} onChange={(e) => set('contatoEntrega', e.target.value)} />
        </div>
      </div>

      {/* Pagamento */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Pagamento</h3>
        {[
          { key: 'aceitaPix', label: 'Aceitar PIX' },
          { key: 'aceitaCartao', label: 'Aceitar Cartão de crédito' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-sm">{label}</Label>
            <Switch checked={Boolean(val(key as any))} onCheckedChange={(v) => set(key as any, v)} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Expiração PIX (minutos)</Label>
            <Input type="number" min={5} max={120} className="mt-1" value={val('pixExpiracaoMinutos') ?? 30} onChange={(e) => set('pixExpiracaoMinutos', Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-sm">Máx. parcelas</Label>
            <Input type="number" min={1} max={12} className="mt-1" value={val('maxParcelas') ?? 3} onChange={(e) => set('maxParcelas', Number(e.target.value))} />
          </div>
        </div>
        <div>
          <Label className="text-sm">Valor mínimo por parcela (R$)</Label>
          <Input type="number" min={5} className="mt-1" value={val('minValorParcela') ?? 10} onChange={(e) => set('minValorParcela', Number(e.target.value))} />
        </div>
      </div>

      {/* Comunicação */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Comunicação</h3>
        <div>
          <Label className="text-sm">Mensagem pós-checkout</Label>
          <Textarea className="mt-1" rows={3} value={val('mensagemConfirmacao') ?? ''} onChange={(e) => set('mensagemConfirmacao', e.target.value)} />
        </div>
        <div>
          <Label className="text-sm">E-mail do responsável</Label>
          <Input
            className="mt-1"
            type="email"
            placeholder="responsavel@apabee.com.br"
            value={val('emailResponsavel') ?? ''}
            onChange={(e) => set('emailResponsavel', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Recebe notificação de cada novo pedido pago. Deixe em branco para desativar.
          </p>
        </div>
      </div>

      <Button onClick={salvar} disabled={atualizar.isPending}>
        {atualizar.isPending ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function GerenciarLojaPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-serif text-accent">Gerenciar Loja</h1>
      <Tabs defaultValue="pedidos">
        <TabsList>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>
        <TabsContent value="pedidos" className="mt-4"><PedidosTab /></TabsContent>
        <TabsContent value="clientes" className="mt-4"><ClientesTab /></TabsContent>
        <TabsContent value="configuracoes" className="mt-4"><ConfigTab /></TabsContent>
      </Tabs>
    </div>
  )
}
