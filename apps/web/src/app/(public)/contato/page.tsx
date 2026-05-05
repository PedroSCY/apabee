import type { Metadata } from 'next'
import { ContatoForm } from './_components/ContatoForm'
import { Mail, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contato — Apabee | APA',
  description: 'Entre em contato com a Associação Pratense de Apicultura.',
}

const INFO = [
  { icon: Mail, label: 'E-mail', value: 'contato@apabee.org.br' },
  { icon: MapPin, label: 'Localização', value: 'Prata — Paraíba, Brasil' },
  { icon: Clock, label: 'Atendimento', value: 'Segunda a Sexta, 8h às 17h' },
]

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Entre em Contato</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Dúvidas, pedidos ou interesse em se associar? Fale com a gente.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Info sidebar */}
        <div className="lg:col-span-2 space-y-5">
          {INFO.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-secondary p-5 mt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              🐝 A APA responde todas as mensagens em até 2 dias úteis. Para compras,
              acesse nossa{' '}
              <a href="/loja" className="text-primary hover:underline underline-offset-4">
                loja
              </a>
              .
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <ContatoForm />
        </div>
      </div>
    </div>
  )
}
