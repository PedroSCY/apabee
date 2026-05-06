import { IconBrandFacebook, IconBrandInstagram, IconMail } from '@tabler/icons-react'
import { Hexagon } from 'lucide-react'
import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/loja', label: 'Loja' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto container px-4 sm:px-6 pt-10 pb-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-honey-gradient">
                <Hexagon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <p className="font-serif text-xl font-semibold text-accent">Apabee</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Associação Pratense de Apicultura. Defendendo as abelhas e valorizando o trabalho do
              apicultor.
            </p>
          </div>

          {/* Nav */}
          <div className="space-y-3">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Navegação
            </h4>
            <ul className="space-y-1">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Associados
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/associados"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Área do Associado
                </Link>
              </li>
              <li>
                <Link
                  href={LINKS[3].href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Quero me associar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Contato
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Prata — PB</li>
              <li>
                <Link
                  href="mailto:apabee.erp@gmail.com"
                  className="hover:text-foreground transition-colors"
                >
                  apabee.erp@gmail.com
                </Link>
              </li>
              <li>Associação Pratense de Apicultura</li>
            </ul>
            <div className="mt-3 flex gap-3">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary"
              >
                <IconBrandInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-primary"
              >
                <IconBrandFacebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:apabee.erp@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="E-mail"
                className="text-muted-foreground hover:text-primary"
              >
                <IconMail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {year} APA — Associação Pratense de Apicultura. Todos os direitos reservados.
          </p>
          <a
            href="https://www.linkedin.com/in/scy-pedrolucas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground"
          >
            By Pedro_scy
          </a>
        </div>
      </div>
    </footer>
  )
}
