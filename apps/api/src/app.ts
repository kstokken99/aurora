import { randomUUID } from 'node:crypto'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import type { ApiError, Mailbox } from '@aurora/contracts'
import { connectMailboxRequestSchema } from '@aurora/contracts'

import { config } from './config'
import { addMailbox, DuplicateMailboxError, getMailData } from './store'

export const app = new Hono()

app.use('*', cors())

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/mail', async (c) => {
  const data = await getMailData()
  return c.json(data)
})

app.post('/api/mailboxes', async (c) => {
  const payload: unknown = await c.req.json().catch(() => null)
  const parsed = connectMailboxRequestSchema.safeParse(payload)

  if (!parsed.success) {
    const error: ApiError = {
      error: 'Check the mailbox details and try again.',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.map((part) =>
          typeof part === 'number' ? part : String(part),
        ),
        message: issue.message,
      })),
    }

    return c.json(error, 400)
  }

  if (!config.demoMode) {
    return c.json(
      {
        error:
          'Live provider verification is not implemented yet. Unset MAIL_DEMO_MODE to use the demo flow.',
      } satisfies ApiError,
      501,
    )
  }

  // Демо-проверка: app password уже подразумевает включённую 2FA у Google.
  // Реальная реализация здесь подключится к IMAP/OAuth провайдера.
  const address = parsed.data.email.trim().toLowerCase()
  const mailbox: Mailbox = {
    id: `mb-${randomUUID()}`,
    address,
    displayName: address.split('@')[0] ?? address,
    provider: 'gmail',
    status: 'connected',
    unreadCount: 0,
    totalMessages: 0,
    lastSyncedAt: new Date().toISOString(),
  }

  try {
    await addMailbox(mailbox)
  } catch (error) {
    if (error instanceof DuplicateMailboxError) {
      return c.json({ error: error.message } satisfies ApiError, 409)
    }

    throw error
  }

  return c.json(mailbox, 201)
})

app.notFound((c) => c.json({ error: 'Not found.' } satisfies ApiError, 404))

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal server error.' } satisfies ApiError, 500)
})
