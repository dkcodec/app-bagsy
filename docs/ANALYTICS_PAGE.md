# Analytics Page

Страница аналитики (`/[locale]/analytics` и подстраницы).

> Контракты бэка см. `docs/ANALYTICS_API_SPEC.md` — этот док про UI/архитектуру фичи.

## Зачем

Владельцы салонов уходят к YCLIENTS без аналитики. Им нужно видеть:
- Сколько заработали за период
- Кто лучший мастер, какая услуга прибыльнее
- Тренды (растём или падаем)
- Загрузку мастеров и точки

## Доступ — матрица «роль × план»

| План      | Роль       | Доступно                                                                                |
| --------- | ---------- | --------------------------------------------------------------------------------------- |
| `solo`    | Owner      | Только `/analytics/me` — он же и мастер, и владелец. Топ-мастеров скрыт.                |
| `point`   | Staff      | Только `/analytics/me`. Никакого доступа к чужой аналитике, финансам, клиентам.         |
| `point`   | Manager    | Все табы по своей локации: overview, staff, finance, clients + drill-down любого мастера. |
| `point`   | Owner      | То же, что Point Manager.                                                               |
| `network` | Staff      | Только `/analytics/me`.                                                                 |
| `network` | Manager    | Все табы по своей локации (как Point Manager).                                          |
| `network` | Owner      | Всё, что Manager + сводка по всем точкам + drill-down `/analytics/locations/[id]` + таб «Локации». |

Реализовано чистой функцией `getAnalyticsAccess(user)` в `src/features/analytics/utils/access.ts`. Это единственный источник правды для:
- табов в шапке (`AnalyticsHeader.allowedTabs`)
- smart-redirect с `/analytics` на `/analytics/me` для Staff/Solo Owner
- гарда `<AnalyticsGuard requires="..." />` на каждой странице

## Роуты

```
app/[locale]/(sidebar)/analytics/
├── layout.tsx                              — AnalyticsHeader + плавный fade переход
├── page.tsx                                — Overview + smart redirect
├── me/page.tsx                             — личная аналитика
├── staff/
│   ├── page.tsx                            — таблица мастеров
│   └── [employeeId]/page.tsx               — drill-down по мастеру
├── locations/[locationId]/page.tsx         — только Network Owner
├── finance/page.tsx
└── clients/page.tsx                        — Beta
```

## Структура фичи

```
src/features/analytics/
  index.ts                          — публичный API
  analytics-header.tsx              — title + role-aware tabs + PeriodPicker
  access-denied.tsx                 — экран «нет прав»

  overview/                         — главная сводка
    analytics-overview.tsx          — оркестратор, запрос данных
    kpi-grid.tsx                    — сетка из 6 KPI-карточек
    revenue-chart.tsx               — AreaChart + overlay прошлого периода
    top-employees-card.tsx          — топ-5 мастеров с drill-down по клику
    top-services-card.tsx           — топ-5 услуг
    funnel-card.tsx                 — воронка created → confirmed → completed
    load-heatmap-card.tsx           — heatmap 7 дней × N часов
    insights-card.tsx               — авто-инсайты (warning/info/success)

  me/
    analytics-me.tsx                — личная аналитика (без топов по другим)

  staff/
    analytics-staff.tsx             — таблица + heatmap + экспорт CSV
    staff-load-heatmap.tsx          — heatmap мастер × день недели
    employee-detail.tsx             — drill-down по мастеру

  locations/
    location-detail.tsx             — drill-down по локации (Network Owner)

  finance/
    analytics-finance.tsx           — выручка + ЗП + маржа + CSV + печать

  clients/
    analytics-clients.tsx           — KPI + сегменты + retention + когорты
    segments-chart.tsx              — горизонтальные бары сегментов
    retention-card.tsx              — % вернувшихся после 1/2/3 визитов
    cohort-table.tsx                — когорты по месяцам

  components/                       — переиспользуемое внутри фичи
    period-picker.tsx               — пресеты + DateRangePicker (popover + Применить)
    kpi-card.tsx                    — value (count-up) + delta %
    top-list.tsx                    — generic Top-N с прогресс-барами
    insight-banner.tsx              — плашка инсайта с цветом по уровню
    chart-empty-state.tsx
    export-button.tsx
    analytics-guard.tsx             — гард доступа для подстраниц
    stagger-grid.tsx                — каскадное появление детей (CSS-var --i)

  utils/
    access.ts                       — getAnalyticsAccess, canAccessTab
    period.ts                       — пресеты, ymdFromDate (tz-safe), inferPreset
    csv.ts                          — downloadCsv (UTF-8 + BOM для Excel)
```

## Shared слой

```
src/shared/services/analytics-service.ts   — методы (сейчас моки; ждёт бэк)
src/shared/hooks/use-analytics.ts          — React Query хуки на каждый эндпоинт
src/shared/hooks/use-count-up.ts           — анимация чисел (requestAnimationFrame)
src/shared/types/analytics.ts              — DTO-контракты (это и есть ТЗ для бэка)
src/shared/mocks/analytics.ts              — детерминированные моки (mulberry32)
src/entities/chart.tsx                     — shadcn ChartContainer над recharts
```

## Метрики на каждой странице

### `/analytics` (Overview)

- 6 KPI: Выручка, Записи, Клиенты, Ср.чек, Загрузка %, Отмены %
- Revenue AreaChart + overlay прошлого периода (пунктир)
- Top-5 мастеров (клик → drill-down) и Top-5 услуг
- Воронка `Создано → Подтверждено → Состоялось`
- Heatmap 7 дней × N часов
- Инсайты (например «Суббота 95% — подумайте о найме»)

Для Solo Owner блок «Топ мастеров» скрывается (он один).

### `/analytics/me`

Урезанный Overview: свои KPI, свой revenue, топ-5 своих услуг, своя heatmap, разрез «новые vs повторные клиенты». Без чужих данных и финансов организации.

### `/analytics/staff`

Таблица: Мастер, Выручка, Записи, Ср.чек, Загрузка %, Отмены `N (%)`, Рейтинг. Сортировка по выручке. Клик по строке → `/analytics/staff/[id]`. Экспорт CSV в подвале карточки (одинаково desktop/mobile). + heatmap мастер × день недели.

### `/analytics/staff/[employeeId]`

KPI мастера, revenue по дням, топ его услуг, нагрузка по часам, разрез клиентов.

### `/analytics/locations/[locationId]` (Network Owner)

Полный аналог Overview, но scope — одна локация. Хлебные крошки «Обзор / [имя локации]».

### `/analytics/finance`

- Выручка: услуги, товары (заглушка `0 ₸`, метка «скоро»)
- ЗП по мастерам (`commission_percent` × выручка от услуг)
- Валовая прибыль и маржа
- Экспорт CSV + печать (`window.print()` с print-стилями)

### `/analytics/clients` (Beta)

- 4 KPI: всего, новых, вернувшихся, потеряно
- Сегменты (Новые/Развивающиеся/Постоянные/VIP/Спящие/Потерянные)
- Retention после 1/2/3 визитов
- Когорты по месяцам
- Помечено `Beta` — клиенты как сущности в API ещё нет, поэтому когортные данные на длительные периоды неточны

## Период и фильтр локации

### Период

Живёт в URL: `?from=YYYY-MM-DD&to=YYYY-MM-DD` — shareable, back/forward работают.

Период сравнения (для delta KPI) в URL **не хранится** — бэк сам вычисляет по правилам пресета (см. `ANALYTICS_API_SPEC.md`).

Пресеты:
- Сегодня
- 7 дней (последние 7 включая сегодня)
- Месяц (MTD: с 1-го по сегодня)
- Квартал (90 дней)
- Период (custom через popover-календарь)

PeriodPicker (`components/period-picker.tsx`):
- На мобиле — 1 месяц в календаре + `align="start"` + `collisionPadding`
- На десктопе — 2 месяца рядом + `align="end"`
- Кнопка «Применить» (изменения не уходят наверх до клика) и «Отмена»
- Будущие даты запрещены через `disabled={{ after: new Date() }}`
- На мобиле сама панель — `overflow-x-auto no-scrollbar` (кнопки скроллятся горизонтально, scrollbar скрыт)

### Локация

Переиспользуется глобальный `NavLocationSwitcher` (`src/widgets/navigation/nav-location-switcher.tsx`). Manager закреплён за своей; Network Owner получает опцию «Все локации».

## Цвета и анимации

### Палитра (только токены темы — никаких хардкодов)

CSS-переменные из `src/styles/shadcn.css`:
- `--accent` (35.65 100% 62%, оранжевый бренд) — основная линия графиков
- `--color-accent-50..950` — градиент для прогресс-баров топ-листов
- `--chart-1..5` — серии чартов
- `--muted-foreground / 0.5` пунктиром — overlay прошлого периода
- `--success` (зелёный 142 71% 45%) — положительная delta KPI
- `--destructive` — отрицательная delta

Графики автоматически переключаются light↔dark через эти переменные.

### Анимации (без новых зависимостей)

Все через `motion-safe:` префикс — респектят `prefers-reduced-motion`.

- **`tailwindcss-animate`** (уже в проекте) — `animate-in fade-in slide-in-from-*`
- **Утилиты в shadcn.css**: `animate-fade-in-up`, `card-hover`, `animate-stagger` (CSS-задержка по var `--i`)
- **Recharts**: `animationDuration=800`, `animationEasing="ease-out"` через `CHART_ANIMATION` в `constants.ts`
- **`useCountUp`** для KPI — `requestAnimationFrame` + ease-out cubic, без зависимостей
- **`StaggerGrid`** — обёртка, проставляющая `--i` детям для каскадного появления
- **`useTransition`** в `AnalyticsHeader` для плавной смены периода без скачков layout
- **Page transitions**: в `analytics/layout.tsx` `key={pathname}` + `animate-in fade-in slide-in-from-bottom-2`
- **Heatmap**: ячейки появляются stagger через CSS animation-delay
- **Progress bars**: ширина анимируется от 0 → finalValue через `transition-[width] duration-700`

## i18n

Все строки в `messages/{ru,kz}.json` под ключом `Analytics.*`:
- `tabs.*`, `period.*`, `kpi.*`, `charts.*`, `funnel.*`, `segments.*`
- `insights.*` — поддержка ICU-подстановок (`{name}`, `{percent}`, `{n}`)
- `staff.columns.*`, `finance.*`, `clients.*`
- `accessDenied`, `staffNotice`, `empty`, `prevPeriod`, `exportCsv`

## Ключевые UI-паттерны

### KPI без подписи «vs пред. период»

На карточках только `▲ +12.5%` (иконка + процент). Контекст «vs предыдущий период» подразумевается выбранным в шапке периодом. Это паттерн YCLIENTS/Stripe — карточки остаются компактными даже на мобиле и в казахском.

В графике подпись «Прошлый» остаётся в tooltip — там есть место.

### Smart redirect

`/analytics/page.tsx` для Staff и Solo Owner делает `router.replace("/analytics/me")`. Manager/Owner на Point — рендерит Overview.

### Drill-down с сохранением периода

Все ссылки drill-down пробрасывают `searchParams.toString()`, чтобы `?from&to` сохранялись. Хлебные крошки ведут обратно с тем же периодом.

### CSV экспорт

`src/features/analytics/utils/csv.ts` — UTF-8 + BOM (`﻿`) для корректной кириллицы в Excel. Без зависимостей. Используется на страницах `/staff` и `/finance`.

## TypeScript / ESLint

Все файлы фичи проходят `tsc --noEmit` без ошибок и `eslint` без warnings.

## Тестирование (TODO когда появится бэк)

Юнит-тесты на:
- `getAnalyticsAccess` для всех 9 комбинаций (role × plan)
- `getPresetRange` и `ymdFromDate` (граничные случаи: TZ +5, 31-е число → февраль)
- `parsePeriodFromSearch` (валидация YYYY-MM-DD, fallback)
- `useCountUp` с `prefers-reduced-motion`

E2E-сценарий:
1. Войти под `staff` → проверить редирект `/analytics` → `/analytics/me`
2. Прямой URL `/analytics/staff` под `staff` → `AccessDenied`
3. Смена периода через picker → обновление URL и данных
4. Клик по топ-мастеру → drill-down + хлебные крошки назад

## История изменений

- **2026-05**: первая версия — моки + полный UI.
- **2026-05-29**: подключён реальный бэк (7 эндпоинтов по `ANALYTICS_API_SPEC.md`), мок-слой удалён. Контракты и компоненты не менялись — только содержимое методов `AnalyticsService`.
