'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart.store'
import {
  useEnderecosCliente,
  useCriarEndereco,
  useConfiguracaoLojaPublica,
  useCheckout,
} from '@/hooks/useLoja'
import { PixPaymentScreen } from './PixPaymentScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Truck, CreditCard, CheckCircle2, Loader2 } from 'lucide-react'
import type { CheckoutResult, CriarEnderecoInput } from '@/lib/api/loja'
import { buscarCep, formatCep } from '@/lib/cep'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STEPS = [
  { label: 'Endereço', icon: MapPin },
  { label: 'Entrega', icon: Truck },
  { label: 'Pagamento', icon: CreditCard },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              i <= current
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <step.icon className="h-3 w-3" />
            {step.label}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-8 mx-1 ${i < current ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function AddressForm({ onSave }: { onSave: (id: string) => void }) {
  const criar = useCriarEndereco()
  const [cepLoading, setCepLoading] = useState(false)
  const [form, setForm] = useState<CriarEnderecoInput>({
    apelido: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
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
    const end = await criar.mutateAsync(form)
    onSave(end.id)
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <div>
        <Label>Apelido <span className="text-destructive">*</span></Label>
        <Input placeholder="Ex: Casa, Trabalho" value={form.apelido} onChange={(e) => set('apelido', e.target.value)} />
      </div>

      {/* CEP primeiro — auto-preenche logradouro, bairro, cidade e UF */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>CEP <span className="text-destructive">*</span></Label>
          <div className="relative mt-0">
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
        <div>
          <Label>Número <span className="text-destructive">*</span></Label>
          <Input placeholder="123" value={form.numero} onChange={(e) => set('numero', e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Logradouro <span className="text-destructive">*</span></Label>
        <Input placeholder="Rua, Av..." value={form.logradouro} onChange={(e) => set('logradouro', e.target.value)} />
      </div>

      <div>
        <Label>Complemento</Label>
        <Input placeholder="Apto, Bloco..." value={form.complemento} onChange={(e) => set('complemento', e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Bairro <span className="text-destructive">*</span></Label>
          <Input value={form.bairro} onChange={(e) => set('bairro', e.target.value)} />
        </div>
        <div>
          <Label>Cidade <span className="text-destructive">*</span></Label>
          <Input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
        </div>
        <div>
          <Label>UF <span className="text-destructive">*</span></Label>
          <Input placeholder="PB" maxLength={2} value={form.estado} onChange={(e) => set('estado', e.target.value.toUpperCase())} />
        </div>
      </div>

      <Button onClick={handleSave} disabled={criar.isPending || cepLoading} className="mt-1">
        {criar.isPending ? 'Salvando...' : 'Usar este endereço'}
      </Button>
    </div>
  )
}

export function CheckoutWizard() {
  const [step, setStep] = useState(0)
  const [enderecoId, setEnderecoId] = useState<string | undefined>()
  const [opcaoEntrega, setOpcaoEntrega] = useState<string>('')
  const [metodoPagamento, setMetodoPagamento] = useState<'PIX' | 'CARTAO'>('PIX')
  const [observacoes, setObservacoes] = useState('')
  const [novoEndereco, setNovoEndereco] = useState(false)
  const [pixResult, setPixResult] = useState<CheckoutResult | null>(null)

  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalPreco = useCartStore((s) => s.totalPreco)

  const { data: enderecos } = useEnderecosCliente()
  const { data: config } = useConfiguracaoLojaPublica()
  const checkout = useCheckout()

  const total = totalPreco()

  const OPCOES_ENTREGA = [
    { id: 'PRATA_GRATIS', label: 'Entrega em Prata - PB', desc: 'Gratuita', ativa: config?.ativaEntregaPrata },
    { id: 'RETIRADA_LOCAL', label: 'Retirada na sede da APA', desc: config?.enderecoRetirada ? `${config.enderecoRetirada}${config.horarioAtendimento ? ' — ' + config.horarioAtendimento : ''}` : 'Retirada local', ativa: config?.ativaRetiradaLocal },
    { id: 'A_COMBINAR', label: 'Outra cidade — A combinar', desc: config?.contatoEntrega ? `Entraremos em contato (${config.contatoEntrega})` : 'Nossa equipe entrará em contato', ativa: config?.ativaACombinar },
  ].filter((o) => o.ativa)

  async function handleFinalizar() {
    if (!opcaoEntrega) { toast.error('Selecione a modalidade de entrega.'); return }

    try {
      const result = await checkout.mutateAsync({
        itens: items.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        opcaoEntrega,
        enderecoEntregaId: enderecoId,
        observacoes: observacoes || undefined,
        metodoPagamento,
      })

      clearCart()

      if (metodoPagamento === 'PIX') {
        setPixResult(result)
      } else if (result.aprovado) {
        toast.success('Pagamento aprovado! Pedido confirmado.')
      } else {
        toast.info('Pagamento em análise. Você receberá um e-mail quando confirmado.')
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao finalizar pedido.')
    }
  }

  if (pixResult?.pedidoId && pixResult.pixCopiaECola) {
    return (
      <Card>
        <CardContent className="pt-6">
          <PixPaymentScreen
            pedidoId={pixResult.pedidoId}
            pixCopiaECola={pixResult.pixCopiaECola}
            pixQrCodeBase64={pixResult.pixQrCodeBase64}
            valorTotal={pixResult.valorTotal}
            expiracaoEm={pixResult.expiracaoEm!}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <StepIndicator current={step} />

      {/* Step 0 — Endereço */}
      {step === 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">Endereço de entrega</h2>
            {enderecos && enderecos.length > 0 && !novoEndereco ? (
              <>
                <div className="space-y-2">
                  {enderecos.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setEnderecoId(e.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        enderecoId === e.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className={`mt-1 h-4 w-4 rounded-full border-2 shrink-0 ${enderecoId === e.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                      <div className="flex-1">
                        <span className="font-medium text-sm">{e.apelido}</span>
                        {e.principal && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Principal</span>}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.logradouro}, {e.numero}{e.complemento ? `, ${e.complemento}` : ''} — {e.bairro}, {e.cidade}/{e.estado}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setNovoEndereco(true)}>+ Novo endereço</Button>
              </>
            ) : (
              <AddressForm onSave={(id) => { setEnderecoId(id); setNovoEndereco(false) }} />
            )}
            <Separator />
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Ponto de referência, instruções de entrega..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => setStep(1)}
              disabled={!enderecoId && !novoEndereco}
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Entrega */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">Modalidade de entrega</h2>
            <div className="space-y-2">
              {OPCOES_ENTREGA.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setOpcaoEntrega(o.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    opcaoEntrega === o.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className={`mt-1 h-4 w-4 rounded-full border-2 shrink-0 ${opcaoEntrega === o.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{o.label}</span>
                    {o.id === 'PRATA_GRATIS' && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Grátis</span>}
                    <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Voltar</Button>
              <Button className="flex-1" onClick={() => setStep(2)} disabled={!opcaoEntrega}>Continuar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Resumo + Pagamento */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <h2 className="font-semibold">Resumo do pedido</h2>

            {/* Itens */}
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.produtoId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.nome} × {item.quantidade}</span>
                  <span className="font-medium">{fmt(item.preco * item.quantidade)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{fmt(total)}</span>
            </div>

            {/* Método de pagamento */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Forma de pagamento</Label>
              <div className="flex gap-2">
                {config?.aceitaPix && (
                  <Button
                    variant={metodoPagamento === 'PIX' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setMetodoPagamento('PIX')}
                  >
                    PIX
                  </Button>
                )}
                {config?.aceitaCartao && (
                  <Button
                    variant={metodoPagamento === 'CARTAO' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setMetodoPagamento('CARTAO')}
                  >
                    Cartão
                  </Button>
                )}
              </div>

              {metodoPagamento === 'CARTAO' && (
                <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 rounded-md p-2 border border-amber-200">
                  Pagamento por cartão disponível em breve. Por enquanto, use PIX.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
              <Button
                className="flex-1"
                onClick={handleFinalizar}
                disabled={checkout.isPending || (metodoPagamento === 'CARTAO')}
              >
                {checkout.isPending ? 'Processando...' : metodoPagamento === 'PIX' ? 'Gerar PIX' : 'Pagar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
