'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  label?: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  error?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

function parse(raw: string): number | undefined {
  const clean = raw.trim()
  if (!clean) return undefined
  const lastComma = clean.lastIndexOf(',')
  const lastDot = clean.lastIndexOf('.')
  const normalized = lastComma > lastDot
    ? clean.replace(/\./g, '').replace(',', '.')
    : clean.replace(/,/g, '')
  const num = parseFloat(normalized)
  return isNaN(num) ? undefined : num
}

function formatDisplay(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Remove chars inválidos e limita a 2 casas decimais durante a digitação. */
function restrict(raw: string): string {
  const clean = raw.replace(/[^\d,.]/g, '')
  const commaIdx = clean.indexOf(',')
  const dotIdx = clean.indexOf('.')
  const sepIdx = commaIdx !== -1 && dotIdx !== -1
    ? Math.min(commaIdx, dotIdx)
    : commaIdx !== -1 ? commaIdx : dotIdx

  if (sepIdx === -1) return clean

  const sep = clean[sepIdx]!
  const intPart = clean.slice(0, sepIdx)
  const decPart = clean.slice(sepIdx + 1).replace(/[,.]/g, '').slice(0, 2)
  return intPart + sep + decPart
}

export function CurrencyInput({
  label,
  value,
  onChange,
  error,
  placeholder = '0,00',
  disabled = false,
  className,
}: CurrencyInputProps) {
  const [focused, setFocused] = React.useState(false)
  const [display, setDisplay] = React.useState<string>(
    value != null ? formatDisplay(value) : '',
  )

  React.useEffect(() => {
    if (!focused) setDisplay(value != null ? formatDisplay(value) : '')
  }, [value, focused])

  function handleFocus() {
    setFocused(true)
    setDisplay(value != null ? String(value).replace('.', ',') : '')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(restrict(e.target.value))
  }

  function handleBlur() {
    setFocused(false)
    const parsed = parse(display)
    onChange(parsed)
    setDisplay(parsed != null ? formatDisplay(parsed) : '')
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm text-muted-foreground">
          R$
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pl-9', error && 'border-destructive focus-visible:ring-destructive')}
        />
      </div>
      {error && (
        <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
