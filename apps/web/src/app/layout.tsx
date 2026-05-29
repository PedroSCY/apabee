import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  // A Fraunces é uma fonte variável, o Next.js já otimiza os eixos (opsz, wght)
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.apabee.com.br'),

  title: {
    default: 'Apabee — Mel Artesanal de Prata - PB',
    template: '%s | Apabee',
  },
  description:
    'Mel puro, própolis e derivados da colmeia produzidos pelos apicultores da Associação Pratense de Apicultura (APA) em Prata - PB. Compre direto do produtor com rastreabilidade total.',
  keywords: [
    'mel artesanal',
    'mel puro',
    'mel de abelha',
    'apicultura',
    'Prata PB',
    'Prata Paraíba',
    'APA',
    'Apabee',
    'própolis',
    'mel paraíba',
    'mel natural',
    'apicultura sustentável',
  ],
  authors: [{ name: 'Associação Pratense de Apicultura', url: 'https://www.apabee.com.br' }],
  creator: 'APA — Associação Pratense de Apicultura',
  publisher: 'APA — Associação Pratense de Apicultura',

  // Open Graph (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.apabee.com.br',
    siteName: 'Apabee',
    title: 'Apabee — Mel Artesanal de Prata - PB',
    description:
      'Mel puro, própolis e derivados produzidos pelos apicultores da APA. Compre direto do produtor.',
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Apabee — Mel Artesanal de Prata - PB',
    description: 'Mel puro e artesanal direto dos apicultores da APA em Prata - PB.',
  },

  // Canonical e indexação
  alternates: {
    canonical: 'https://www.apabee.com.br',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        {/* JSON-LD WebSite — instrui o Google a exibir "Apabee" como nome do site (não "apabee.com.br") */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Apabee',
              alternateName: 'APA — Associação Pratense de Apicultura',
              url: 'https://www.apabee.com.br',
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
