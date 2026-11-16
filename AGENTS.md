# Правила проекта Aurora

Этот файл — контракт для всех, кто пишет код в проекте (людей и AI-агентов).
Проект — **npm-workspaces монорепозиторий**: SPA на **Vite + React 19 +
TypeScript** (TanStack Router, TanStack Table, shadcn/ui, Tailwind CSS v4, Zod,
React Hook Form, Zustand) и backend на **Hono** с общими контрактами в
`packages/contracts`.

## Команды

```bash
nvm use                 # Node.js из .nvmrc (>= 24)
npm install             # зависимости всех workspace'ов
npm run dev             # API (:3001) + Vite (:5173) одновременно
npm run dev:web         # только фронтенд
npm run dev:api         # только API
npm run typecheck       # tsc во всех workspace'ах
npm run lint            # eslint .
npm run build           # сборка API и web
npm run preview         # production-сборка web (:4173)
cd apps/web && npx shadcn@latest add <component>
```

Порты: web — `5173` (`4173` для `preview`), API — `3001`. Vite проксирует
`/api/*` на API (`API_URL`, по умолчанию `http://localhost:3001`), поэтому
фронтенд всегда обращается к относительному `/api/...`.

Перед завершением задачи обязательно выполните:

```bash
npm run typecheck && npm run lint && npm run build
```

## Новые зависимости

Правило действует для **любой** новой npm-зависимости.

1. Перед установкой проверьте, что задача не решается уже установленными
   библиотеками. Выберите поддерживаемую версию (`npm view <pkg> version`).
2. Устанавливайте через `npm` с Node.js из `.nvmrc` в нужный workspace:
   `npm install <pkg> -w @aurora/web`, `npm install -D <pkg> -w @aurora/api`.
   Общие dev-инструменты (ESLint, TypeScript) — в корень без `-w`.
3. Сразу после установки добавьте в этот файл раздел с правилами использования:
   назначение, разрешённые API и паттерны, ограничения, пример.
4. Обновите `README.md`, если зависимость меняет стек или команды.
5. Добавьте запись в `CHANGELOG.md`.
6. Выполните `npm run typecheck && npm run lint && npm run build`.

## История изменений

История ведётся в [`CHANGELOG.md`](./CHANGELOG.md).

- Каждое заметное изменение (новая функциональность, зависимость, поведение,
  исправление) фиксируется отдельной записью.
- Новая запись добавляется сверху в раздел с датой в формате `YYYY-MM-DD`.
- Внутри записи используйте группы `Добавлено`, `Изменено`, `Исправлено`,
  `Удалено`.
- Запись должна объяснять, **что** изменилось и **зачем**, а не пересказывать
  diff.
- Запись о новой зависимости делается в той же правке, что и установка.

## Структура

```text
apps/
  web/                    # SPA: Vite + React
    src/
      routes/             # файловый роутинг TanStack Router
        __root.tsx        # корневой layout (header, Outlet, devtools)
        index.tsx         # "/"
        mail.tsx          # "/mail" — почты и письма, данные из API
        profile.tsx       # "/profile"
      components/
        ui/               # shadcn/ui примитивы (генерируются CLI)
      features/
        mail/             # таблицы, колонки, ячейки, API-клиент почты
      schemas/            # Zod-схемы, нужные только фронтенду
      stores/             # Zustand-сторы (только клиентское состояние)
      lib/utils.ts        # cn()
      main.tsx            # createRouter + RouterProvider
      routeTree.gen.ts    # ГЕНЕРИРУЕТСЯ, не редактировать
  api/                    # backend: Hono
    src/
      server.ts           # запуск HTTP-сервера
      app.ts              # маршруты /api/*
      config.ts           # PORT, MAIL_DEMO_MODE
      store.ts            # хранилище demo-данных
      seed.ts             # стартовые данные для demo-режима
    data/                 # runtime-данные API, gitignored
packages/
  contracts/              # общие Zod-схемы и типы API
    src/
      mail.ts             # почты, письма, запрос подключения, ошибки
      index.ts            # публичные экспорты пакета
CHANGELOG.md
```

В корне проекта также лежат `AGENTS.md`, `README.md`, `CHANGELOG.md`,
`eslint.config.js` и workspace-`package.json`.

## Монорепозиторий и workspace'ы

- Workspace'ы — `apps/web` (`@aurora/web`), `apps/api` (`@aurora/api`),
  `packages/contracts` (`@aurora/contracts`). Дополнительный monorepo-инструмент
  не используется: только npm workspaces.
- Код приложения не импортирует файлы другого приложения напрямую
  (`apps/web` ↔ `apps/api`). Всё общее идёт через `@aurora/contracts`.
- `@aurora/contracts` экспортирует TypeScript-исходники. Web получает их через
  alias в `vite.config.ts`/`tsconfig`, API — через `noExternal` в
  `apps/api/tsup.config.ts` (иначе `node dist/server.js` не найдёт пакет).
- Новые команды добавляйте в `package.json` того workspace'а, к которому они
  относятся; корневые скрипты запускают их через `npm run <script> -w <pkg>` или
  `--workspaces`.
- Секреты и `.env` не коммитятся. Всё, что похоже на пароль/токен, живёт только
  на сервере и никогда не попадает в клиентский бандл.

## API (Hono)

- Все маршруты живут под `/api/*` в `apps/api/src/app.ts`.
- Тело запроса валидируйте Zod-схемой из `@aurora/contracts` через
  `safeParse`; при ошибке возвращайте `400` и форму `ApiError` с `issues`.
- Коды ответов: `400` — невалидные данные, `409` — конфликт (например, почта уже
  подключена), `501` — сценарий ещё не реализован, `404`/`500` — стандартные.
- Ответы API описывайте схемами в `@aurora/contracts`; фронтенд парсит их на
  границе (`mail-api.ts`), а не доверяет форме ответа.
- Конфигурация — только через env в `config.ts` с безопасным значением по
  умолчанию (`PORT`, `MAIL_DEMO_MODE`). Не читайте `process.env` по коду
  напрямую.
- Demo-режим (`MAIL_DEMO_MODE`, по умолчанию включён) проверяет только формат
  данных. Реальную проверку провайдера (IMAP/OAuth) добавляйте за тем же
  контрактом, не меняя клиент.
- Пароли приложений и токены не логируйте и не сохраняйте в открытом виде.
  Текущее файловое хранилище (`apps/api/src/store.ts`) — временное demo-решение;
  при появлении БД замените его реализацией репозитория.

## Библиотеки backend'а

### `hono`

- Назначение: HTTP-роутинг и middleware API.
- Используйте `new Hono()`, `app.get/post/use`, `c.req.json()`, `c.json()`,
  `app.notFound`, `app.onError`.
- Валидацию и типы берите из `@aurora/contracts`, а не описывайте заново.
- Не добавляйте бизнес-логику в обработчики: хранилище и побочные эффекты — в
  отдельных модулях (`store.ts`).

```ts
app.get('/api/mail', async (c) => {
  const data = await getMailData()
  return c.json(data)
})
```

### `@hono/node-server`

- Назначение: запуск Hono-приложения на Node.js.
- Используйте только в `apps/api/src/server.ts` через `serve({ fetch, port })`.
- Не импортируйте его в web и в переиспользуемые модули API.

### `tsx`

- Назначение: запуск TypeScript в dev-режиме API без сборки.
- Только скрипт `dev`: `tsx watch src/server.ts`. Для production — собранный
  `dist/server.js` через `node`.

### `tsup`

- Назначение: сборка API в один ESM-бандл для Node.
- Конфигурация — в `apps/api/tsup.config.ts`. Не удаляйте
  `noExternal: ['@aurora/contracts']`.
- Сборка должна запускаться без флагов: `npm run build -w @aurora/api`.

### `concurrently`

- Назначение: параллельный запуск API и web в корневом `npm run dev`.
- Используйте только в корневом скрипте. Для одиночных запусков есть
  `npm run dev:api` и `npm run dev:web`.

```json
"dev": "concurrently -n api,web -c blue,green \"npm run dev -w @aurora/api\" \"npm run dev -w @aurora/web\""
```

## Общие соглашения

- Импорты внутри web — только через alias `@/...`, например
  `@/components/ui/button`; общие контракты — `@aurora/contracts`.
- Экспорты — именованные. Default export допустим только там, где его требует
  инструмент.
- Только type-only импорты: `import type { Foo } from '...'` (включён
  `verbatimModuleSyntax`).
- `any` запрещён. Если без него никак — сначала объясните причину в комментарии.
- Не добавляйте barrel-файлы (`index.ts`-реэкспорты) без необходимости.
  Исключение — публичный вход `packages/contracts/src/index.ts`.

## TanStack Router

Роутинг файловый. Плагин `@tanstack/router-plugin` сам генерирует
`apps/web/src/routeTree.gen.ts` при `dev`/`build`.

- **Никогда не редактируйте `apps/web/src/routeTree.gen.ts` вручную.** Он в
  `.gitignore` для линтера и перезаписывается плагином.
- Новый экран — новый файл в `apps/web/src/routes/`:
  - `/` → `apps/web/src/routes/index.tsx`
  - `/profile` → `apps/web/src/routes/profile.tsx`
  - `/posts/$postId` → `apps/web/src/routes/posts.$postId.tsx`
  - вложенный layout → `apps/web/src/routes/posts.tsx` (родитель) +
    `apps/web/src/routes/posts.index.tsx` (дочерний индекс)
  - pathless layout → `apps/web/src/routes/_layout.tsx`
  - корневой layout → `apps/web/src/routes/__root.tsx`
- Файлы и папки, начинающиеся с `-`, роутер игнорирует — используйте их для
  приватных компонентов/утилит рядом с маршрутом:
  `apps/web/src/routes/-components/profile-card.tsx`.
- Объявление маршрута:

  ```tsx
  export const Route = createFileRoute('/profile')({
    component: ProfilePage,
    validateSearch: (search) => profileSearchSchema.parse(search),
    loader: () => getProfile(),
  })
  ```

- Внутренние переходы — только `<Link to="...">`. Обычный `<a href>` — только
  для внешних ссылок.
- Параметры и search читайте через API маршрута:
  `Route.useParams()`, `Route.useSearch()`.
- Загрузка серверных данных — в `loader`/`beforeLoad` через функции из
  `features/<feature>/*-api.ts`, а не в `useEffect`. Ошибки — через
  `errorComponent`, отсутствие данных — через `notFoundComponent`.
- В `loader` возвращайте уже провалидированные данные: ответы API парсите
  Zod-схемами из `@aurora/contracts` на границе.
- Search-параметры валидируйте Zod-схемой в `validateSearch`.
- `react-router` и `react-router-dom` запрещены (ESLint это проверяет).

## shadcn/ui

- Компоненты добавляются **только через CLI**:

  ```bash
  cd apps/web
  npx shadcn@latest add dialog select table
  ```

  Вручную файлы в `apps/web/src/components/ui/` не создавайте.
- Файлы в `apps/web/src/components/ui/` считаются vendored-кодом. Правьте их
  только при реальной необходимости и фиксируйте причину в PR.
- Прикладные компоненты собирайте в `apps/web/src/features/<feature>/`, а не в
  `components/ui/`.
- Используйте `cn()` из `@/lib/utils` для условных классов.
- Только семантические токены темы: `bg-background`, `text-muted-foreground`,
  `border-border`, `ring-ring` и т. п. Хардкод цветов (`#fff`, `bg-white`,
  `text-gray-500`) запрещён.
- Тёмная тема — через класс `.dark` на `<html>`.
- Иконки — `lucide-react`.
- Для форм используйте семейство `Field` (`Field`, `FieldLabel`,
  `FieldError`, `FieldGroup`) из `@/components/ui/field`; старого
  `Form`-враппера в проекте нет.

## Zod

- Общие схемы API (то, что пересекает границу web ↔ api) лежат в
  `packages/contracts/src/<domain>.ts` и экспортируются из
  `packages/contracts/src/index.ts`.
- Схемы, нужные только фронтенду (например, форма профиля), лежат в
  `apps/web/src/schemas/`, имя файла — `<domain>-schema.ts`.
- Схема — единственный источник истины. Типы получайте из неё:

  ```ts
  export const profileSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
  })

  export type Profile = z.infer<typeof profileSchema>
  ```

- Не дублируйте TypeScript-интерфейсы рядом со схемой и не описывайте типы API
  вручную в web — импортируйте из `@aurora/contracts`.
- Используйте API Zod 4: `z.email()`, `z.url()`, `z.uuid()` вместо устаревших
  `z.string().email()` и т. п.
- Если есть трансформации/coercion, различайте `z.input` (что приходит в форму)
  и `z.output` (что получается после валидации).
- Валидируйте всё на границах: тело запроса на сервере, ответы API на клиенте,
  `localStorage`, search-параметры.
- Тексты ошибок в схеме — пользовательские, на языке интерфейса.

## React Hook Form

- Формы живут в `apps/web/src/features/<feature>/` (или рядом с маршрутом, если
  форма уникальна для экрана).
- Всегда связывайте форму с Zod через `zodResolver`:

  ```tsx
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  })
  ```

- `defaultValues` обязательны.
- Нативные поля — через `register`. Кастомные контролы shadcn/ui (Select,
  Checkbox, Combobox, кастомные input) — через `Controller`.
- Ошибки показывайте через `<FieldError errors={[errors.name]} />` и
  `aria-invalid` на контроле.
- Не дублируйте состояние формы в `useState` или Zustand. RHF — единственный
  владелец состояния формы.
- Не валидируйте вручную в `onSubmit`: всё уже сделано схемой.
- Динамические списки — `useFieldArray`.

## Zustand

- Один стор на домен: `apps/web/src/stores/<domain>-store.ts`, экспорт
  `use<Domain>Store`.
- Используйте каррированную форму:

  ```ts
  export const useCounterStore = create<CounterState>()((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }))
  ```

- В компонентах подписывайтесь на минимальный срез:

  ```tsx
  const count = useCounterStore((state) => state.count)
  ```

  Не возвращайте из селектора новый объект без `useShallow`.
- Действия (actions) — внутри стора. Мутировать состояние снаружи нельзя.
- Стор-файлы не импортируют React и не содержат JSX.
- В Zustand — только клиентское состояние (UI, настройки, черновики). Серверные
  данные и кеш живут в loader'ах TanStack Router (или TanStack Query, если
  появится) и не дублируются в сторе.
- `persist` — только для пользовательских настроек, с `partialize`, `version` и
  `migrate`, чтобы не ломать сохранённые данные.

## TanStack Table

Используется **v9**. В v9 нет `useReactTable` — таблица создаётся через
`useTable`, а возможности подключаются явно через `tableFeatures`.

- Фичи, колонки и данные держите стабильными: `features` и `columns` — на
  уровне модуля, `data` — константа или `useMemo`. Новый массив на каждом
  рендере ломает кэш row-моделей.
- Регистрируйте только нужные фичи и row-model фабрики в одном объекте:

  ```ts
  export const mailTableFeatures = tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    filterFns: { includesString: filterFn_includesString },
    sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime },
  })
  ```

  Не используйте `stockFeatures`: это бандл всех возможностей.
- Колонки описывайте через
  `createColumnHelper<typeof features, Row>()`, а не через один generic:

  ```ts
  const helper = createColumnHelper<typeof mailTableFeatures, Message>()
  export const columns = helper.columns([
    helper.accessor('subject', { header: 'Subject' }),
  ])
  ```

- Разметка — shadcn/ui `Table`, ячейки и заголовки — через
  `table.FlexRender`, а не ручной `flexRender`.
- Ячейки с интерактивом (кнопки, чекбоксы) выносите в отдельный
  `*-cells.tsx`; файл с колонками не должен экспортировать компоненты.
- Для строк всегда задавайте стабильный `getRowId: (row) => row.id`. Не
  используйте индекс.
- Выделение строк храните и читайте по ID:
  `table.getSelectedRowIds()`, а не по индексам. После удаления данных чистите
  `rowSelection` вручную.
- Клиентская обработка: подключите нужные row-model и не ставьте
  `manual*`. Серверная: `manualPagination`/`manualSorting`/`manualFiltering` +
  `rowCount`/`pageCount`, а данные приходят уже обработанными.
- Таблица не загружает данные. Данные для экрана приходят из `loader`
  TanStack Router; фильтры, которые должны быть в URL, храните в search-params
  маршрута.
- Состояние таблицы (сортировка, пагинация, фильтр, выделение) — локальное,
  если им не нужно делиться между экранами. Для контролируемых срезов
  передавайте `state` + соответствующий `on*Change`.
- Пагинация и фильтры должны иметь пустое состояние и сбрасывать `pageIndex`
  при смене данных (по умолчанию `autoResetPageIndex` включён).
- Заголовки сортируемых колонок — кнопки с `column.getToggleSortingHandler()`
  и иконкой направления; не делайте сортировку по клику на `<th>` без
  доступного контрола.

## Границы ответственности

- **TanStack Router** — навигация, URL, загрузка данных для экрана из API.
- **TanStack Table** — представление табличных данных, сортировка, фильтры,
  пагинация и выделение на клиенте.
- **Hono** — HTTP API, валидация входа и хранение серверных данных.
- **`@aurora/contracts`** — общие Zod-схемы и типы границы web ↔ api.
- **Zod** — валидация и типы данных.
- **React Hook Form** — состояние и отправка форм.
- **Zustand** — общее клиентское состояние между экранами.
- **shadcn/ui + Tailwind** — отображение.

Не смешивайте: форма не хранит своё состояние в Zustand, стор не делает запросы
«на рендере», а компонент не парсит URL вручную. Серверные данные приходят из
`loader` → `/api`, а не из статических массивов во фронтенде.
