import { z } from 'zod';

export const createOfferSchema = z.object({
  price: z
    .number()
    .min(1, 'Цена должна быть больше 0')
    .max(10000, 'Максимальная цена 10000 лир'),
});

export const updateOfferSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});
