# Aurora

Монорепозиторий на npm workspaces: SPA с почтами и письмами и backend API для
них.

- `apps/web` — Vite + React 19 + TypeScript, TanStack Router, TanStack Table,
  shadcn/ui, Tailwind CSS v4, Zod, React Hook Form, Zustand.
- `apps/api` — Hono + `@hono/node-server`, Zod-валидация, demo-хранилище в
  JSON-файле.
- `packages/contracts` — общие Zod-схемы и типы API для web и api.

## Запуск

Требуется Node.js >= 24 (см. `.nvmrc`).

```bash
nvm use
npm install
npm run dev
```

`npm run dev` запускает оба сервиса параллельно:

| Сервис | URL                     |
| ------ | ----------------------- |
| Web    | <http://localhost:5173> |
| API    | <http://localhost:3001> |

Vite проксирует `/api/*` на API, поэтому фронтенд использует относительные
запросы и не зависит от адреса бэкенда в браузере.

Нужен только один сервис — `npm run dev:web` или `npm run dev:api`.

## Переменные окружения

| Переменная       | Где    | По умолчанию            | Назначение                                      |
| ---------------- | ------ | ----------------------- | ----------------------------------------------- |
| `PORT`           | API    | `3001`                  | Порт HTTP-сервера API                           |
| `MAIL_DEMO_MODE` | API    | включён                 | `false` отключает demo-подключение (ответ `501`) |
| `API_URL`        | Web    | `http://localhost:3001` | Куда Vite проксирует `/api/*`                   |

Переменные читаются из окружения процесса. Секреты (пароли приложений, токены)
не коммитятся и не попадают в клиентский бандл.

## Скрипты

| Команда             | Что делает                              |
| ------------------- | --------------------------------------- |
| `npm run dev`       | API + web одновременно                  |
| `npm run dev:web`   | Только dev-сервер Vite                  |
| `npm run dev:api`   | Только API с `tsx watch`                |
| `npm run typecheck` | Проверка типов во всех workspace'ах     |
| `npm run lint`      | ESLint                                  |
| `npm run build`     | Сборка API (`tsup`) и web (`vite build`) |
| `npm run preview`   | Локальный просмотр production-сборки    |

## API

| Метод  | Путь             | Назначение                                        |
| ------ | ---------------- | ------------------------------------------------- |
| `GET`  | `/api/health`    | Проверка доступности                              |
| `GET`  | `/api/mail`      | Почты и письма (`MailData`)                       |
| `POST` | `/api/mailboxes` | Подключение Google-почты: email, app password, 2FA |

Тело запроса и ответы описаны Zod-схемами в
`packages/contracts/src/mail.ts`. Ошибки возвращаются в форме
`{ error, issues? }`: `400` — невалидные данные, `409` — почта уже подключена,
`501` — live-проверка провайдера ещё не реализована.

Demo-режим проверяет только формат данных (16 символов app password и 6-значный
код) и не обращается к Google. Данные хранятся в `apps/api/data/mail.json`
(gitignored) и создаются из `apps/api/src/seed.ts` при первом запуске.

## Структура

```text
apps/
  web/
    src/
      routes/          # файловые маршруты TanStack Router
      components/ui/   # shadcn/ui примитивы
      features/        # прикладные фичи (mail/ — таблицы, колонки, API-клиент)
      schemas/         # Zod-схемы, нужные только фронтенду
      stores/          # Zustand-сторы (клиентское состояние)
      lib/utils.ts     # cn()
      routeTree.gen.ts # генерируется автоматически
  api/
    src/               # Hono-приложение, конфиг, хранилище, seed
    data/              # runtime-данные, gitignored
packages/
  contracts/
    src/               # общие Zod-схемы и типы API
```

Новый маршрут — новый файл в `apps/web/src/routes/`. Новый shadcn-компонент —
`cd apps/web && npx shadcn@latest add <component>`. Новая сущность, которая
пересекает границу web ↔ api, — схема в `packages/contracts`.

## Соглашения

Правила разработки, структура папок и ограничения по каждой библиотеке описаны
в [AGENTS.md](./AGENTS.md). История изменений — в [CHANGELOG.md](./CHANGELOG.md).
