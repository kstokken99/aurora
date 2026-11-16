import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Mailbox, MailData } from '@aurora/contracts'
import { mailDataSchema } from '@aurora/contracts'

import { seedMailData } from './seed'

// Файловое хранилище — временное решение для демо. При появлении БД
// замените его реализацией репозитория, не меняя контракт API.
const dataFile = fileURLToPath(new URL('../data/mail.json', import.meta.url))

let cache: MailData | null = null
let mutationQueue: Promise<void> = Promise.resolve()

export class DuplicateMailboxError extends Error {
  constructor(address: string) {
    super(`Mailbox ${address} is already connected.`)
    this.name = 'DuplicateMailboxError'
  }
}

async function persist(data: MailData) {
  await mkdir(dirname(dataFile), { recursive: true })
  const tempFile = `${dataFile}.tmp`
  await writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  await rename(tempFile, dataFile)
}

async function load(): Promise<MailData> {
  if (cache) {
    return cache
  }

  let data: MailData

  try {
    const raw = await readFile(dataFile, 'utf8')
    data = mailDataSchema.parse(JSON.parse(raw))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }

    data = mailDataSchema.parse(seedMailData)
    await persist(data)
  }

  cache = data
  return data
}

export async function getMailData(): Promise<MailData> {
  return load()
}

export function addMailbox(mailbox: Mailbox): Promise<void> {
  const mutation = mutationQueue.then(async () => {
    const data = await load()

    if (data.mailboxes.some((item) => item.address === mailbox.address)) {
      throw new DuplicateMailboxError(mailbox.address)
    }

    const next: MailData = {
      ...data,
      mailboxes: [mailbox, ...data.mailboxes],
    }

    cache = next
    await persist(next)
  })

  mutationQueue = mutation.catch(() => undefined)
  return mutation
}
