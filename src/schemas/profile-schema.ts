import { z } from 'zod'

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name must be at most 80 characters.'),
  email: z.email('Enter a valid email address.'),
  bio: z
    .string()
    .trim()
    .max(280, 'Bio must be at most 280 characters.')
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
