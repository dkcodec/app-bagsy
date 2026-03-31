# Bagsy LK — Обзор проекта

**Личный кабинет** (app.bagsy.kz) для управления салонами красоты: записи, сотрудники, услуги, локации, календарь.

---

## Стек

| Технология        | Версия | Назначение                  |
| ----------------- | ------ | --------------------------- |
| Next.js           | 16     | App Router, SSR             |
| React             | 19     | UI                          |
| TypeScript        | 5      | Типизация                   |
| TailwindCSS       | 4      | Стили                       |
| TanStack Query    | 5      | Серверный стейт             |
| Zustand           | 5      | Локальный стейт (календарь) |
| Zod               | 4      | Валидация форм              |
| react-hook-form   | 7      | Формы                       |
| shadcn/ui (Radix) | —      | UI-компоненты               |
| next-intl         | 4      | i18n (ru, kz)               |
| next-themes       | —      | Тема (light/dark)           |
| Serwist           | 9      | PWA + Service Worker        |
| date-fns          | 4      | Даты                        |
| Leaflet           | —      | Карты (выбор адреса)        |
| @dnd-kit          | —      | Drag & Drop в календаре     |

---

## Архитектура: Feature-Sliced Design (FSD)

```
app/                          # Next.js App Router (страницы)
├── [locale]/(auth)/          # Логин, инвайт
├── [locale]/(sidebar)/       # Основные страницы с сайдбаром
│   ├── (dashboard)/          # Календарь (главная)
│   ├── staff/                # Сотрудники
│   ├── locations/            # Локации
│   ├── services/             # Услуги
│   └── account/              # Аккаунт (профиль + настройки, 4 таба)

src/
├── widgets/                  # Составные UI-блоки
│   ├── navigation/           # Сайдбар (app-sidebar, nav-main, nav-user)
│   ├── calendar-widget/      # Календарь (month/week/day/agenda views)
│   ├── forms/                # Phone input, dropdown
│   └── ui/                   # Theme toggle, locale switcher
├── features/                 # Бизнес-логика
│   ├── auth/                 # LoginForm, InviteForm
│   ├── calendar/             # CalendarContext (Zustand), диалоги, настройки
│   ├── dashboard/            # DashboardPage, DashboardHeader
│   ├── staff/                # Таблица сотрудников, RegisterStaffForm
│   ├── locations/            # Таблица локаций, AddLocationForm, карта
│   ├── services/             # Таблица услуг, AddServiceForm, LocationSelect
│   └── account/              # Аккаунт: профиль, подписка, безопасность, внешний вид
├── entities/                 # UI-примитивы (shadcn/ui обёртки)
│   └── *.tsx                 # Button, Dialog, Input, Table, etc.
└── shared/                   # Общая инфраструктура
    ├── api/client.ts         # HTTP-клиент (fetch, auto-refresh 401 + proactive refresh)
    ├── services/             # API-сервисы
    ├── hooks/                # React Query хуки
    ├── types/                # TypeScript типы/интерфейсы
    ├── schemas/              # Zod-схемы валидации
    ├── utils/                # Утилиты (cookies, jwt, datetime, formatters)
    └── providers/            # QueryProvider, ThemeProvider
```

---

## Ключевые файлы

### API слой

| Файл                                      | Назначение                                         |
| ----------------------------------------- | -------------------------------------------------- |
| `src/shared/api/client.ts`                | HTTP-клиент с auto-refresh 401 + proactive refresh |
| `src/shared/services/auth-service.ts`     | Авторизация                                        |
| `src/shared/services/calendar-service.ts` | Календарь записей                                  |
| `src/shared/services/employee-service.ts` | Сотрудники (`GET /api/v1/employees`)               |
| `src/shared/services/booking-service.ts`  | Бронирования/записи                                |
| `src/shared/services/location-service.ts` | Локации                                            |
| `src/shared/services/service-service.ts`  | Услуги + категории                                 |
| `src/shared/services/master-service.ts`   | Привязка сотрудников к услугам                     |
| `src/shared/services/media-service.ts`    | Загрузка медиа (S3 presigned URL)                  |

### Хуки (React Query)

| Файл                                      | Хуки                                                                |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `src/shared/hooks/use-auth.ts`            | useLogin, useLogout, usePasswordReset                               |
| `src/shared/hooks/use-users.ts`           | useCurrentUser, useUpdateProfile                                    |
| `src/shared/hooks/use-calendar.ts`        | useCalendar (main hook)                                             |
| `src/shared/hooks/user-staff.ts`          | useGetEmployees, useInviteEmployee                                  |
| `src/shared/hooks/use-services.ts`        | useLocationServices, useServiceCategories, useCreateService         |
| `src/shared/hooks/use-network-points.ts`  | useLocations, useLocation, useCreateLocation, useLocationCategories |
| `src/shared/hooks/use-bagsies.ts`         | useCreateBooking, useCancelBooking                                  |
| `src/shared/hooks/use-master-services.ts` | useCreateMasterService                                              |

### Типы

| Файл                           | Содержимое                                     |
| ------------------------------ | ---------------------------------------------- |
| `src/shared/types/user.ts`     | EUserRole, IEmployeeDto, IUserDto (deprecated) |
| `src/shared/types/calendar.ts` | IEvent, CalendarApiResponse, TCalendarView     |
| `src/shared/types/staff.ts`    | IStaffDto (deprecated)                         |

### Утилиты

| Файл                                      | Назначение                                         |
| ----------------------------------------- | -------------------------------------------------- |
| `src/shared/utils/cookies.ts`             | setAuthTokens, getAccessToken, clearAuthTokens     |
| `src/shared/utils/jwt.ts`                 | decodeJwt (client-side)                            |
| `src/shared/utils/calendar-api-mapper.ts` | API → IEvent маппинг                               |
| `src/shared/utils/formater.ts`            | parseTimestamp, formatTimestamp, toTimestampWithTz |

---

## Авторизация

1. Логин: `POST /api/v1/auth/login` → `{access_token, refresh_token}`
2. Токены хранятся в cookies: access (15 мин), refresh (30 дней)
3. При 401 — автоматический refresh через mutex в HttpClient
4. **Proactive refresh**: если access_token отсутствует (истёк cookie), но refresh_token есть — обновляем до запроса, не дожидаясь 401
5. При неудачном refresh — редирект на `/{locale}/login`
6. JWT payload: `{ sub: employee_id, org: organization_id, role: string }`

---

## Ролевая модель

| Роль      | Описание             |
| --------- | -------------------- |
| `owner`   | Владелец организации |
| `manager` | Менеджер локации     |
| `staff`   | Мастер/сотрудник     |

Дополнительно используются **атрибуты** (ABAC):

- `can_provide_services` — может оказывать услуги (у owner в SOLO плане = true)
- `can_manage_location_schedule` — может управлять расписанием локации

---

## Терминология (актуальная)

| Термин                     | Описание                  |
| -------------------------- | ------------------------- |
| `location` / `location_id` | Точка обслуживания (UUID) |
| `employee` / `employee_id` | Сотрудник (UUID)          |
| `booking`                  | Запись/бронирование       |
| `organization_id`          | UUID организации          |

---

## i18n

- Локали: `ru` (по умолчанию), `kz`
- Файлы: `messages/ru.json`, `messages/kz.json`
- Роутинг: `app/[locale]/...`
- Библиотека: `next-intl`

---

## Окружение

| Переменная                 | Назначение                          |
| -------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Базовый URL API                     |
| `NEXT_PUBLIC_PHONE_NUMBER` | Телефон поддержки                   |
| `NEXT_PUBLIC_DOMAIN`       | Домен (для ссылок на terms/privacy) |
