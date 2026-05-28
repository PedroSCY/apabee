import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Gera a imagem Open Graph padrão do site (usada no WhatsApp, Facebook, Twitter, etc.)
 * Registrada automaticamente pelo Next.js App Router como og:image.
 *
 * Preview: https://www.apabee.com.br/opengraph-image
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#1a0d05',
          padding: '80px 88px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Decoração: hexágono grande — top-right ── */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            display: 'flex',
            opacity: 0.07,
          }}
        >
          <svg viewBox="0 0 100 100" width="380" height="380">
            <polygon
              points="50,4 96,27 96,73 50,96 4,73 4,27"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* ── Decoração: hexágono médio — bottom-right ── */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: 200,
            display: 'flex',
            opacity: 0.04,
          }}
        >
          <svg viewBox="0 0 100 100" width="260" height="260">
            <polygon
              points="50,4 96,27 96,73 50,96 4,73 4,27"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* ── Barra âmbar vertical esquerda ── */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 6,
            height: 630,
            background: 'linear-gradient(180deg, #FBBF24 0%, #B45309 100%)',
            display: 'flex',
          }}
        />

        {/* ── Ícone da Apabee ── */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #B45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 36,
          }}
        >
          <svg viewBox="0 0 32 32" width="60" height="60">
            <polygon
              points="16,7 24.5,11.5 24.5,20.5 16,25 7.5,20.5 7.5,11.5"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* ── Nome da marca ── */}
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            color: '#fdf9f6',
            lineHeight: 1.0,
            marginBottom: 16,
            letterSpacing: '-3px',
          }}
        >
          Apabee
        </div>

        {/* ── Tagline âmbar ── */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 500,
            color: '#F59E0B',
            marginBottom: 52,
            letterSpacing: '-0.5px',
          }}
        >
          Mel Artesanal de Prata — PB
        </div>

        {/* ── Linha divisória âmbar ── */}
        <div
          style={{
            width: 96,
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #FBBF24 0%, #92400e 100%)',
            marginBottom: 36,
            display: 'flex',
          }}
        />

        {/* ── Rodapé ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ fontSize: 24, color: '#a0683a', fontWeight: 400 }}>
            Associação Pratense de Apicultura
          </div>
          <div style={{ fontSize: 24, color: '#a0683a', fontWeight: 400 }}>
            www.apabee.com.br
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
