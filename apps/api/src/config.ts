const DEFAULT_PORT = 3001

function parsePort(value: string | undefined) {
  const port = Number.parseInt(value ?? '', 10)
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT
}

export const config = {
  port: parsePort(process.env.PORT),
  // Демо-режим включён по умолчанию: подключение проверяет формат данных
  // и не ходит к провайдеру. MAIL_DEMO_MODE=false отключает демо-сценарий.
  demoMode: process.env.MAIL_DEMO_MODE !== 'false',
}
