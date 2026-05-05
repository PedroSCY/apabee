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
    <footer className="border-t border-border/60 bg-secondary">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="text-2xl leading-none">🐝</span>
              <span>Apabee</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              APA reúne os apicultores de Prata e região. Conheça nossos méis, própolis, cera e geleia real produzidos com qualidade.
            </p>
          </div>

          {/* Nav */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Navegação</h3>
            <ul className="space-y-2">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contato@apabee.org.br" className="hover:text-foreground transition-colors">
                  contato@apabee.org.br
                </a>
              </li>
              <li>Prata — PB</li>
              <li>Associação Pratense de Apicultura</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {year} APA — Associação Pratense de Apicultura. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Feito com cuidado em Prata - PB 🍯
          </p>
        </div>
      </div>
    </footer>
  )
}
