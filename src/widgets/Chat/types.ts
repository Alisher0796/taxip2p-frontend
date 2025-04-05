import { z } from 'zod'

export const messageSchema = z.object({
  id: z.string(),
  text: z.string(),
  userId: z.number(),
  createdAt: z.string(),
  username: z.string().optional()
})

export type Message = z.infer<typeof messageSchema>
