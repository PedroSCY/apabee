import type { Metadata } from 'next'
import { ContatoForm } from './_components/ContatoForm'
import { Mail, MapPin, Clock } from 'lucide-react'
import ConteudoPublico from '@/components/public/ConteudoPublico'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contato — Apabee | APA',
  description: 'Entre em contato com a Associação Pratense de Apicultura.',
}

const INFO = [
  { icon: Mail, label: 'E-mail', value: 'apabee.erp@gmail.com' },
  { icon: MapPin, label: 'Localização', value: 'Prata — Paraíba, Brasil' },
  { icon: Clock, label: 'Atendimento', value: 'Segunda a Sexta, 8h às 17h' },
]

export default function ContatoPage() {
  return (
    <section className="py-16">
      <ConteudoPublico>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary">Contato</p>
              <h1 className="mt-2 font-serif text-5xl font-semibold text-accent">
                Fale com a Apabee
              </h1>
              <p className="mt-3 text-muted-foreground">
                Quer se associar, comprar em quantidade ou tirar dúvidas? Estamos à disposição.
              </p>
            </div>

            <div className='space-y-4 mt-6'>
              {INFO.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 ">
                    <Icon className="h-6 w-6 text-primary" />
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
                  A APA responde todas as mensagens em até 2 dias úteis. Para compras, acesse
                  nossa{' '}
                  <Link href="/loja" className="text-primary hover:underline underline-offset-4">
                    loja
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          <div>
            <ContatoForm />
          </div>
        </div>
      </ConteudoPublico>
    </section>
  )
}
