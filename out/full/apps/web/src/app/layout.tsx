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
  title: 'Apabee — Sistema da APA',
  description: 'APA reúne os apicultores de Prata e região.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
