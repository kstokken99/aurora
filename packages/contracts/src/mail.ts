import { z } from 'zod'

export const mailboxProviderSchema = z.enum([
  'gmail',
  'outlook',
  'icloud',
  'custom',
])

export const mailboxStatusSchema = z.enum(['connected', 'syncing', 'error'])

export const mailboxSchema = z.object({
  id: z.string().min(1),
  address: z.email(),
  displayName: z.string().min(1),
  provider: mailboxProviderSchema,
  status: mailboxStatusSchema,
  unreadCount: z.number().int().nonnegative(),
  totalMessages: z.number().int().nonnegative(),
  lastSyncedAt: z.iso.datetime(),
})

export const messageSchema = z.object({
  id: z.string().min(1),
  mailboxId: z.string().min(1),
  subject: z.string(),
  senderName: z.string(),
  senderEmail: z.email(),
  receivedAt: z.iso.datetime(),
  isRead: z.boolean(),
  hasAttachments: z.boolean(),
  snippet: z.string(),
  labels: z.array(z.string()),
})

export const mailDataSchema = z.object({
  mailboxes: z.array(mailboxSchema),
  messages: z.array(messageSchema),
})

const APP_PASSWORD_PATTERN = /^[a-z0-9]{16}$/i

export const connectMailboxRequestSchema = z.object({
  email: z.email('Enter the Google account email.'),
  appPassword: z
    .string()
    .trim()
    .min(1, 'Enter the 16-character app password.')
    .refine(
      (value) => APP_PASSWORD_PATTERN.test(value.replace(/\s+/g, '')),
      'The app password must contain exactly 16 letters or digits.',
    ),
  twoFactorCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from the authenticator app.'),
})

export const apiErrorIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
})

export const apiErrorSchema = z.object({
  error: z.string(),
  issues: z.array(apiErrorIssueSchema).optional(),
})

export type MailboxProvider = z.infer<typeof mailboxProviderSchema>
export type MailboxStatus = z.infer<typeof mailboxStatusSchema>
export type Mailbox = z.infer<typeof mailboxSchema>
export type Message = z.infer<typeof messageSchema>
export type MailData = z.infer<typeof mailDataSchema>
export type ConnectMailboxInput = z.infer<typeof connectMailboxRequestSchema>
export type ApiError = z.infer<typeof apiErrorSchema>
