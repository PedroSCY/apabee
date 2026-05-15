'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
  name?: string
  disabled?: boolean
  error?: string
  className?: string
}

function applyPhoneMask(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Input com máscara de telefone brasileiro: (XX) XXXXX-XXXX */
export function PhoneInput({ value, onChange, label, id, name, disabled, error, className }: PhoneInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    onChange(applyPhoneMask(digits))
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder="(34) 99999-0000"
        disabled={disabled}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        maxLength={16}
      />
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}
