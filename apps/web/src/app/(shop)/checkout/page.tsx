'use client'

import { useState } from 'react'
import { CheckoutWizard } from '@/components/shop/CheckoutWizard'
import ConteudoPublico from '@/components/public/ConteudoPublico'

export default function CheckoutPage() {
  return (
    <ConteudoPublico className="py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold font-serif mb-6 text-accent">Finalizar compra</h1>
        <CheckoutWizard />
      </div>
    </ConteudoPublico>
  )
}
