'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface DecimalInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  decimals?: number
  min?: number
  max?: number
  label?: string
  id?: string
  unit?: string
  disabled?: boolean
  error?: string
  placeholder?: string
  className?: string
}

function format(value: number, decimals: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
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

/** Remove caracteres inválidos e limita casas decimais durante a digitação. */
function restrict(raw: string, maxDecimals: number): string {
  // Permite apenas dígitos e um separador decimal (vírgula ou ponto)
  const clean = raw.replace(/[^\d,.]/g, '')
  if (maxDecimals === 0) return clean.replace(/[,.].*$/, '')

  // O primeiro separador encontrado vence
  const commaIdx = clean.indexOf(',')
  const dotIdx = clean.indexOf('.')
  const sepIdx = commaIdx !== -1 && dotIdx !== -1
    ? Math.min(commaIdx, dotIdx)
    : commaIdx !== -1 ? commaIdx : dotIdx

  if (sepIdx === -1) return clean

  const sep = clean[sepIdx]!
  const intPart = clean.slice(0, sepIdx)
  // Após o separador: só dígitos, no máximo maxDecimals
  const decPart = clean.slice(sepIdx + 1).replace(/[,.]/g, '').slice(0, maxDecimals)
  return intPart + sep + decPart
}

/**
 * Input numérico com formatação decimal.
 * No foco mostra valor bruto; ao sair formata com `decimals` casas.
 */
export function DecimalInput({
  value,
  onChange,
  decimals = 2,
  min,
  max,
  label,
  id,
  unit,
  disabled,
  error,
  placeholder,
  className,
}: DecimalInputProps) {
  const [focused, setFocused] = React.useState(false)
  const [display, setDisplay] = React.useState<string>(
    value != null ? format(value, decimals) : '',
  )

  React.useEffect(() => {
    if (!focused) setDisplay(value != null ? format(value, decimals) : '')
  }, [value, focused, decimals])

  function handleFocus() {
    setFocused(true)
    // Mostra o valor com separador pt-BR (vírgula) para edição
    setDisplay(value != null ? String(value).replace('.', ',') : '')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(restrict(e.target.value, decimals))
  }

  function handleBlur() {
    setFocused(false)
    let parsed = parse(display)
    if (parsed != null && min != null && parsed < min) parsed = min
    if (parsed != null && max != null && parsed > max) parsed = max
    onChange(parsed)
    setDisplay(parsed != null ? format(parsed, decimals) : '')
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder ?? `0,${'0'.repeat(decimals)}`}
          disabled={disabled}
          className={cn(
            unit && 'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}
