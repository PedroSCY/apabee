'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

interface ShopAuthButtonProps {
  redirectTo?: string
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'ghost'
  label?: string
  className?: string
}

/** Botão de login com Google OAuth para clientes da loja. */
export function ShopAuthButton({
  redirectTo,
  size = 'sm',
  variant = 'outline',
  label = 'Entrar com Google',
  className,
}: ShopAuthButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (redirectTo) callbackUrl.searchParams.set('next', redirectTo)

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogin}
      disabled={loading}
      className={`gap-2 ${className ?? ''}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      {label}
    </Button>
  )
}
