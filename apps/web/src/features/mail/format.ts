const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const numberFormatter = new Intl.NumberFormat('en-US')

export function formatDateTime(isoDate: string) {
  return dateTimeFormatter.format(new Date(isoDate))
}

export function formatCount(value: number) {
  return numberFormatter.format(value)
}
