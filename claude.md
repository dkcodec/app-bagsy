# Bagsy LK — Инструкции для Claude

## Проект
Личный кабинет (app.bagsy.kz) для управления салонами красоты, мед центрами и любыми другими услугами с возможностью записи. Next.js 16 + React 19 + TypeScript 5 + TailwindCSS 4.

## Стиль кода
- **Чем меньше строк кода тем лучше**
- **Комментарии НЕ удалять**, а наоборот добавлять везде
- Отвечай кратко
- Не останавливайся пока не реализуешь функцию до конца
- Перед изменениями — дай краткое описание текущего состояния
- При ошибках — начни с рассуждений (несколько параграфов), потом решение
- Проанализируй функционал перед изменениями
- Разбей на необходимые шаги, включая только действительно нужные

## Архитектура: Feature-Sliced Design

```
app/[locale]/(auth)/     — Логин, инвайт
app/[locale]/(sidebar)/  — Основные страницы (dashboard, staff, locations, services, settings, profile)
src/widgets/             — Составные UI (сайдбар, календарь)
src/features/            — Бизнес-логика (auth, calendar, dashboard, staff, locations, services, profile, settings)
src/entities/            — UI-примитивы (shadcn/ui обёртки)
src/shared/api/          — HTTP-клиент (fetch, auto-refresh 401)
src/shared/services/     — API-сервисы
src/shared/hooks/        — React Query хуки
src/shared/types/        — TypeScript типы
src/shared/schemas/      — Zod-схемы
src/shared/utils/        — Утилиты (cookies, jwt, datetime, formatters)
src/shared/providers/    — QueryProvider, ThemeProvider
```

## Терминология API (НОВАЯ)

| Термин | Описание | Старое название |
|---|---|---|
| `locations` | Точки обслуживания | points |
| `employees` | Сотрудники | staff |
| `bookings` | Записи/бронирования | bagsies |
| `organization_id` | UUID организации | network_code |
| `location_id` | UUID точки | point_code |
| `employee_id` | UUID сотрудника | master_phone |

## Ролевая модель

Роли: `owner`, `manager`, `staff` + атрибуты ABAC (`can_provide_services`, `can_manage_location_schedule`).

## API конвенции

- Базовый URL: `NEXT_PUBLIC_API_URL`
- Prefix: `/api/v1/`
- Auth: Bearer token в header `Authorization`
- Timestamps: ISO 8601 + TZ offset (`2025-01-25T14:00:00.000+05:00`)
- Schedule time-of-day: epoch `1970-01-01T09:00:00.000+05:00`

## Ключевые паттерны

- **API клиент**: `src/shared/api/client.ts` — кастомный fetch-клиент с mutex на refresh
- **Серверный стейт**: TanStack Query v5 (staleTime: 5 мин)
- **Локальный стейт**: Zustand (календарь)
- **Формы**: react-hook-form + Zod
- **i18n**: next-intl, локали `ru` (default) / `kz`, файлы в `messages/`
- **Токены**: cookies (access 15 мин, refresh 30 дней)

## Документация

Подробная документация в `docs/`:
- `PROJECT_OVERVIEW.md` — архитектура и стек
- `API_ENDPOINTS.md` — все эндпоинты из swagger
- `API_MIGRATION.md` — маппинг старый → новый API
- `API_TIMESTAMPS.md` — конвенция timestamp
- `BACKEND_TABLES.md` — структура БД
- `REGISTRATION_FLOW.md` — регистрация владельца (лендинг)
- `PLANS.md` — тарифы
- `FLOW_SOLO/POINT/NETWORK.md` — пользовательские флоу
- `FLOW_ADD_MASTER.md` — добавление мастера

## Важно

- Регистрация — в другом проекте (лендинг bagsy.kz), в ЛК её НЕ реализуем
- Часть GET-эндпоинтов (`/users/me`, `/employees`, `/locations`, `/services`) скоро появятся — не ломать текущую логику
- Телефон уникален, но используются UUID для всех сущностей
