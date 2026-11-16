import type {
  ConnectMailboxInput,
  Mailbox,
  MailData,
} from '@aurora/contracts'
import {
  apiErrorSchema,
  mailDataSchema,
  mailboxSchema,
} from '@aurora/contracts'

async function readErrorMessage(response: Response) {
  const payload: unknown = await response.json().catch(() => null)
  const parsed = apiErrorSchema.safeParse(payload)

  if (parsed.success) {
    return parsed.data.error
  }

  return `Request failed with status ${response.status}.`
}

export async function fetchMailData(): Promise<MailData> {
  const response = await fetch('/api/mail')

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return mailDataSchema.parse(await response.json())
}

export async function connectMailbox(
  input: ConnectMailboxInput,
): Promise<Mailbox> {
  const response = await fetch('/api/mailboxes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return mailboxSchema.parse(await response.json())
}
