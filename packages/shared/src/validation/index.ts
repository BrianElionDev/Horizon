import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const createIdeaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(5000).optional(),
  origin: z.string().max(500).optional(),
})

export const updateIdeaSchema = createIdeaSchema.partial()

export type LoginInput = z.infer<typeof loginSchema>
export type CreateIdeaInput = z.infer<typeof createIdeaSchema>
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>
