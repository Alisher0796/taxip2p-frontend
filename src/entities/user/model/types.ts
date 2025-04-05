import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  username: z.string().optional(),
  role: z.enum(['passenger', 'driver']).optional(),
  car: z.object({
    brand: z.string(),
    plateNumber: z.string()
  }).optional()
})

export type User = z.infer<typeof userSchema>

export const driverDataSchema = z.object({
  brand: z.string().min(2, 'Минимум 2 символа'),
  plateNumber: z.string().min(5, 'Введите корректный номер')
})

export type DriverData = z.infer<typeof driverDataSchema>
