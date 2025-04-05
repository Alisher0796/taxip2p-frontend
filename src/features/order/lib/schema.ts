import { z } from 'zod';

export const createOrderSchema = z.object({
  fromAddress: z
    .string()
    .min(5, 'Минимум 5 символов')
    .max(100, 'Максимум 100 символов'),
  toAddress: z
    .string()
    .min(5, 'Минимум 5 символов')
    .max(100, 'Максимум 100 символов'),
  price: z
    .number()
    .min(1, 'Цена должна быть больше 0')
    .max(10000, 'Максимальная цена 10000 лир')
    .optional(),
  comment: z
    .string()
    .max(200, 'Максимум 200 символов')
    .optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(['accepted', 'inProgress', 'completed', 'cancelled']),
  finalPrice: z.number().optional(),
});
