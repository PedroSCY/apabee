'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CpfInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
  name?: string
  disabled?: boolean
  error?: string
  className?: string
}

function applyCpfMask(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Input com máscara de CPF: 000.000.000-00 */
export function CpfInput({ value, onChange, label, id, name, disabled, error, className }: CpfInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    onChange(applyCpfMask(digits))
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        name={name}
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder="000.000.000-00"
        disabled={disabled}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        maxLength={14}
      />
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}
