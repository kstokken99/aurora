import type { MailboxProvider, MailboxStatus } from '@aurora/contracts'

export const providerLabels: Record<MailboxProvider, string> = {
  gmail: 'Gmail',
  outlook: 'Outlook',
  icloud: 'iCloud',
  custom: 'Aurora Mail',
}

export const mailboxStatusLabels: Record<MailboxStatus, string> = {
  connected: 'Connected',
  syncing: 'Syncing',
  error: 'Error',
}
