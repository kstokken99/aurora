# Правила проекта Aurora

Этот файл — контракт для всех, кто пишет код в проекте (людей и AI-агентов).
Стек: **Vite + React 19 + TypeScript**, **TanStack Router**, **shadcn/ui**,
**Tailwind CSS v4**, **Zod**, **React Hook Form**, **Zustand**.

## Команды

```bash
nvm use                 # Node.js из .nvmrc (>= 22.12)
npm install
npm run dev             # dev-сервер Vite
npm run typecheck       # tsc -b
npm run lint            # eslint .
npm run build           # typecheck + production build
npx shadcn@latest add <component>
```

Перед завершением задачи обязательно выполните:

```bash
npm run typecheck && npm run lint && npm run build
```

## Структура

```text
src/
  routes/                 # файловый роутинг TanStack Router
    __root.tsx            # корневой layout (header, Outlet, devtools)
    index.tsx             # "/"
    profile.tsx           # "/profile"
  components/
    ui/                   # shadcn/ui примитивы (генерируются CLI)
  features/<feature>/     # фича: компоненты, хуки, модели
  schemas/                # Zod-схемы
  stores/                 # Zustand-сторы
  lib/utils.ts            # cn()
  main.tsx                # createRouter + RouterProvider
  routeTree.gen.ts        # ГЕНЕРИРУЕТСЯ, не редактировать
```

- Импорты только через alias `@/...`, например `@/components/ui/button`.
- Экспорты — именованные. Default export допустим только там, где его требует
  инструмент.
- Только type-only импорты: `import type { Foo } from '...'` (включён
  `verbatimModuleSyntax`).
- `any` запрещён. Если без него никак — сначала объясните причину в комментарии.
- Не добавляйте barrel-файлы (`index.ts`-реэкспорты) без необходимости.

## TanStack Router

Роутинг файловый. Плагин `@tanstack/router-plugin` сам генерирует
`src/routeTree.gen.ts` при `dev`/`build`.

- **Никогда не редактируйте `src/routeTree.gen.ts` вручную.** Он в
  `.gitignore` для линтера и перезаписывается плагином.
- Новый экран — новый файл в `src/routes/`:
  - `/` → `src/routes/index.tsx`
  - `/profile` → `src/routes/profile.tsx`
  - `/posts/$postId` → `src/routes/posts.$postId.tsx`
  - вложенный layout → `src/routes/posts.tsx` (родитель) +
    `src/routes/posts.index.tsx` (дочерний индекс)
  - pathless layout → `src/routes/_layout.tsx`
  - корневой layout → `src/routes/__root.tsx`
- Файлы и папки, начинающиеся с `-`, роутер игнорирует — используйте их для
  приватных компонентов/утилит рядом с маршрутом:
  `src/routes/-components/profile-card.tsx`.
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
- Загрузка данных — в `loader`/`beforeLoad`, а не в `useEffect`. Ошибки —
  через `errorComponent`, отсутствие данных — через `notFoundComponent`.
- Search-параметры валидируйте Zod-схемой в `validateSearch`.
- `react-router` и `react-router-dom` запрещены (ESLint это проверяет).

## shadcn/ui

- Компоненты добавляются **только через CLI**:

  ```bash
  npx shadcn@latest add dialog select table
  ```

  Вручную файлы в `src/components/ui/` не создавайте.
- Файлы в `src/components/ui/` считаются vendored-кодом. Правьте их только при
  реальной необходимости и фиксируйте причину в PR.
- Прикладные компоненты собирайте в `src/features/<feature>/`, а не в
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

- Схемы лежат в `src/schemas/`, имя файла — `<domain>-schema.ts`.
- Схема — единственный источник истины. Типы получайте из неё:

  ```ts
  export const profileSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
  })

  export type Profile = z.infer<typeof profileSchema>
  ```

- Не дублируйте TypeScript-интерфейсы рядом со схемой.
- Используйте API Zod 4: `z.email()`, `z.url()`, `z.uuid()` вместо устаревших
  `z.string().email()` и т. п.
- Если есть трансформации/coercion, различайте `z.input` (что приходит в форму)
  и `z.output` (что получается после валидации).
- Валидируйте всё на границах: ответы API, `localStorage`, search-параметры.
- Тексты ошибок в схеме — пользовательские, на языке интерфейса.

## React Hook Form

- Формы живут в `src/features/<feature>/` (или рядом с маршрутом, если форма
  уникальна для экрана).
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

- Один стор на домен: `src/stores/<domain>-store.ts`, экспорт
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
  данные и кеш — в loader'ах TanStack Router (или TanStack Query, если появится).
- `persist` — только для пользовательских настроек, с `partialize`, `version` и
  `migrate`, чтобы не ломать сохранённые данные.

## Границы ответственности

- **TanStack Router** — навигация, URL, загрузка данных для экрана.
- **Zod** — валидация и типы данных.
- **React Hook Form** — состояние и отправка форм.
- **Zustand** — общее клиентское состояние между экранами.
- **shadcn/ui + Tailwind** — отображение.

Не смешивайте: форма не хранит своё состояние в Zustand, стор не делает запросы
«на рендере», а компонент не парсит URL вручную.
