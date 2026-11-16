# История изменений

Формат вдохновлён [Keep a Changelog](https://keepachangelog.com/): новые записи
добавляются сверху, внутри — группы «Добавлено», «Изменено», «Исправлено»,
«Удалено».

## 2026-11-16 — Монорепозиторий и backend API

### Добавлено

- npm-workspaces монорепозиторий: `apps/web` (прежний фронтенд), `apps/api`
  (backend) и `packages/contracts` (общие Zod-схемы и типы API).
- Backend на Hono: `GET /api/health`, `GET /api/mail`,
  `POST /api/mailboxes` с Zod-валидацией и кодами `400`/`409`/`501`.
- Пакет `@aurora/contracts`: схемы почт, писем, запроса подключения и ошибок
  API — единый источник истины для web и api.
- Demo-хранилище `apps/api/src/store.ts` с атомарной записью в
  `apps/api/data/mail.json` (gitignored) и seed-данные в
  `apps/api/src/seed.ts` вместо статического массива во фронтенде.
- Переменные окружения `PORT` и `MAIL_DEMO_MODE` (API) и `API_URL` (Vite
  proxy), порт API `3001`, прокси `/api/*` с `5173`/`4173`.
- Зависимости: `hono` и `@hono/node-server` (API), `tsx` и `tsup`
  (dev/сборка API), `concurrently` (параллельный `npm run dev`).
- Правила монорепозитория, API и использования новых зависимостей в
  `AGENTS.md`.

### Изменено

- `/mail` загружает почты и письма из API через `loader` TanStack Router;
  ответы валидируются общими схемами, ошибки показываются через
  `errorComponent`.
- Модальное окно подключения почты отправляет email, 16-символьный app password
  и 6-значный код в API, показывает состояние отправки и ошибки сервера, а после
  успеха инвалидирует loader.
- Корневые `dev`/`build`/`typecheck` работают по всем workspace'ам; сборка API
  встраивает `@aurora/contracts` в бандл, чтобы `node dist/server.js` работал без
  структуры монорепозитория.
- `README.md` описывает новую структуру, команды, порты, env и endpoints.

### Удалено

- Демо-стор `useMailStore` и статический `mail-data.ts` во фронтенде: серверные
  данные больше не дублируются в Zustand.
- Локальная схема `connect-mailbox-schema.ts` во фронтенде: заменена общей
  схемой из `@aurora/contracts`.

## 2026-11-16 — Подключение почты через Google

### Добавлено

- Кнопка «Connect account» на `/mail` и модальное окно с двухшаговым
  подключением Google-почты: 16-символьный app password, затем 6-значный код
  двухфакторной аутентификации.
- Zod-схема `connectMailboxSchema` для валидации обоих шагов и shadcn/ui
  `dialog` для модального окна.
- Демо-стор `useMailStore`: подключённый ящик сразу появляется в таблице и
  сохраняется при переходах между экранами.

### Изменено

- Список почт на `/mail` читается из Zustand-стора, а не из статичного массива.

## 2026-11-16 — Почты и письма

### Добавлено

- Страница `/mail`: привязанные к пользователю почты и письма из этих почт.
  Таблицы на TanStack Table v9 с сортировкой, поиском, пагинацией и выбором
  строк. Фильтрация писем по выбранной почте.
- Моковые данные в `src/features/mail/mail-data.ts`: 5 почтовых ящиков и 24
  письма.
- Компоненты `MailboxTable` и `MessagesTable`, колонки и ячейки вынесены в
  `src/features/mail/`.
- Зависимость `@tanstack/react-table` v9.
- Правила использования TanStack Table в `AGENTS.md`.
- Правила установки новых зависимостей и ведения этого файла в `AGENTS.md`.
- `CHANGELOG.md` как единая история изменений проекта.

### Изменено

- В навигацию добавлен пункт «Mail».
- На главную добавлена карточка со ссылкой на страницу почт.
- `README.md` дополнен TanStack Table и ссылкой на историю изменений.

## 2026-11-16 — Базовая настройка стека

### Добавлено

- Vite + React 19 + TypeScript: Tailwind CSS v4 и alias `@/*`.
- shadcn/ui: CLI, тема, `cn()`, компоненты `button`, `card`, `input`, `label`,
  `textarea`, `field`, `separator`.
- TanStack Router: файловый роутинг, корневой layout, маршруты `/` и `/profile`,
  devtools.
- Zod + React Hook Form: схема профиля и форма с валидацией.
- Zustand: стор счётчика и пример подписки на срез состояния.
- `AGENTS.md` с правилами проекта, `README.md` и `.nvmrc`.
- ESLint: запрет `react-router`/`react-router-dom`, игнор сгенерированного
  `routeTree.gen.ts`.
