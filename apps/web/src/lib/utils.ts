import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina classes Tailwind com suporte a condicionais e resolução de conflitos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
