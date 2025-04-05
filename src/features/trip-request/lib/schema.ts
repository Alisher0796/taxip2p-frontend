import { z } from 'zod';

export const tripRequestSchema = z.object({
  fromAddress: z
    .string()
    .min(5, 'Минимум 5 символов')
    .max(100, 'Максимум 100 символов'),
  toAddress: z
    .string()
    .min(5, 'Минимум 5 символов')
    .max(100, 'Максимум 100 символов'),
  desiredPrice: z
    .number()
    .min(1, 'Цена должна быть больше 0')
    .max(10000, 'Максимальная цена 10000 лир'),
  pickupTime: z.enum(['PT15M', 'PT30M', 'PT1H']),
  comment: z
    .string()
    .max(200, 'Максимум 200 символов')
    .optional(),
});

export const driverProfileSchema = z.object({
  carModel: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(50, 'Максимум 50 символов'),
  licensePlate: z
    .string()
    .min(5, 'Минимум 5 символов')
    .max(10, 'Максимум 10 символов')
    .regex(/^[A-Z0-9]+$/, 'Только заглавные буквы и цифры'),
});

export const priceOfferSchema = z.object({
  price: z
    .number()
    .min(1, 'Цена должна быть больше 0')
    .max(10000, 'Максимальная цена 10000 лир'),
});
