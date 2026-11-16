# Aurora

SPA на Vite + React 19 + TypeScript с файловым роутингом и типобезопасными
формами.

## Стек

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [TanStack Router](https://tanstack.com/router) — файловый роутинг
- [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4 — UI
- [Zod](https://zod.dev/) — схемы и валидация
- [React Hook Form](https://react-hook-form.com/) — формы
- [Zustand](https://zustand.docs.pmnd.rs/) — клиентское состояние

## Запуск

Требуется Node.js >= 22.12 (см. `.nvmrc`).

```bash
nvm use
npm install
npm run dev
```

## Скрипты

| Команда             | Что делает                        |
| ------------------- | --------------------------------- |
| `npm run dev`       | Dev-сервер Vite                   |
| `npm run typecheck` | Проверка типов (`tsc -b`)         |
| `npm run lint`      | ESLint                            |
| `npm run build`     | Проверка типов + production build |
| `npm run preview`   | Локальный просмотр сборки         |

## Структура

```text
src/
  routes/          # файловые маршруты TanStack Router
  components/ui/   # shadcn/ui примитивы
  features/        # прикладные фичи
  schemas/         # Zod-схемы
  stores/          # Zustand-сторы
  lib/utils.ts     # cn()
  routeTree.gen.ts # генерируется автоматически
```

Новый маршрут — новый файл в `src/routes/`. Новый shadcn-компонент — через
`npx shadcn@latest add <component>`.

## Соглашения

Правила разработки, структура папок и ограничения по каждой библиотеке описаны
в [AGENTS.md](./AGENTS.md).
