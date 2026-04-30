import { z } from 'zod'

export const UUIDSchema = z.string().uuid()

export const EmailSchema = z.string().email()

export const PercentualSchema = z
  .number()
  .min(0, 'Percentual não pode ser negativo')
  .max(100, 'Percentual não pode exceder 100')

export const VolumeSchema = z
  .number()
  .positive('Volume deve ser maior que zero')

export const PrecoSchema = z
  .number()
  .positive('Preço deve ser maior que zero')
  .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais')

export const PeriodoSchema = z
  .object({
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
  })
  .refine((p) => p.dataFim >= p.dataInicio, {
    message: 'dataFim deve ser maior ou igual a dataInicio',
  })
