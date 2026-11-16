import { create } from 'zustand'

import {
  mailboxes as initialMailboxes,
  type Mailbox,
} from '@/features/mail/mail-data'

type MailState = {
  mailboxes: Mailbox[]
  connectMailbox: (email: string) => void
}

// Демо-состояние: когда появится API, список почт должен приходить из loader'а,
// а в сторе останутся только клиентские настройки интерфейса.
export const useMailStore = create<MailState>()((set) => ({
  mailboxes: initialMailboxes,
  connectMailbox: (email) => {
    const address = email.trim().toLowerCase()
    const mailbox: Mailbox = {
      id: `mb-${crypto.randomUUID()}`,
      address,
      displayName: address.split('@')[0] ?? address,
      provider: 'gmail',
      status: 'connected',
      unreadCount: 0,
      totalMessages: 0,
      lastSyncedAt: new Date().toISOString(),
    }

    set((state) => ({
      mailboxes: [
        mailbox,
        ...state.mailboxes.filter((item) => item.address !== address),
      ],
    }))
  },
}))
