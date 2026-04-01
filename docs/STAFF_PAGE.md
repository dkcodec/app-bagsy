# Staff Page

Страница управления сотрудниками (`/[locale]/staff`).

## Доступ

- **Owner** — полный доступ: приглашение, смена роли, трансфер, активация/деактивация
- **Manager** — может видеть список, управлять правами (ABAC), но не менять роли
- **Staff** — нет доступа к странице

## Компоненты

```
app/[locale]/(sidebar)/staff/page.tsx
  └── StaffHeader + StaffContent

src/features/staff/
  staff-content.tsx             — оркестратор (данные, фильтры, пагинация, drawer)
  staff-filters.tsx             — панель фильтров + кнопка приглашения
  add-staff-dialog.tsx          — диалог приглашения нового сотрудника
  constants.ts                  — DEFAULT_STAFF_FILTERS (limit=15, sort_order=desc)

  components/
    table-row.tsx               — строка сотрудника (grid layout, как в услугах)
    employee-row-actions.tsx    — DropdownMenu (⋯): View, Change role, Transfer, Activate/Deactivate
    sort-icon.tsx               — иконка направления сортировки
    pagination.tsx              — пагинация + счётчик лимита подписки
    error-message.tsx           — блок ошибки загрузки

    drawer/
      employee-drawer.tsx       — адаптивный drawer сотрудника
      profile-tab.tsx           — таб «Профиль»: инфо, права (ABAC), статистика
      services-tab.tsx          — таб «Услуги»: список услуг сотрудника
      portfolio-tab.tsx         — таб «Портфолио»: плейсхолдер
      index.ts                  — barrel-экспорт

  utils/
    format-role.ts              — getRoleKey (роль → i18n-ключ)
    avatar-color.ts             — утилиты цвета аватара
```

## Таблица

Grid-layout (аналогично `service-row.tsx`), контейнер `border rounded-lg overflow-hidden`:

| Колонка     | Desktop                        | Mobile        |
| ----------- | ------------------------------ | ------------- |
| Имя         | Аватар + имя (сортируемо)      | + роль снизу  |
| Телефон     | `text-muted-foreground`        | скрыт         |
| Роль        | `Badge variant="secondary"`    | скрыт         |
| Статус      | `Badge default/outline`        | скрыт         |
| Действия    | `EmployeeRowActions` (⋯)       | ✓             |

Grid columns:
- Mobile: `grid-cols-[1fr_32px]`
- Desktop: `grid-cols-[1fr_120px_100px_90px_32px]`

Заголовки колонок: `bg-muted/30`, только `hidden md:grid`.
Строки: `hover:bg-muted/50`, неактивные: `opacity-50`.
Выбранная строка: `bg-muted/50`.

## Фильтры (`staff-filters.tsx`)

| Элемент          | Mobile          | Desktop        |
| ---------------- | --------------- | -------------- |
| Поиск            | full-width      | `flex-1`       |
| Локация          | `flex-1`        | `w-[160px]`    | (только network)
| Роль             | `flex-1`        | `w-[140px]`    |
| Статус           | `flex-1`        | `w-[140px]`    |
| Кнопка `+`       | только иконка   | иконка + текст |

Поиск: debounce 500 мс, бэкенд параметр `search` (ILIKE по имени/фамилии/телефону).

**Лимит подписки**: если `employeeLimits.used >= employeeLimits.max` (и `max != null`):
- Кнопка `+` становится `variant="outline"`
- Клик перенаправляет на `/account?tab=subscription`

## Drawer сотрудника (`employee-drawer.tsx`)

Адаптивный:
- **Mobile** (`useIsMobile()`): Vaul `Drawer` — bottom sheet, свайп вниз
- **Desktop**: `Sheet` — правая панель

3 таба:
1. **Профиль** — телефон, локация, статус-бадж, дата регистрации, ABAC-свичи, статистика
2. **Услуги** — список услуг сотрудника (`useGetEmployeeServices`), скелетоны, итого
3. **Портфолио** — плейсхолдер

### Статус-бадж

- Кликабельный (если план ≠ solo) → открывает диалог подтверждения
- Solo-план: бадж некликабельный, деактивация недоступна

### ABAC-свичи (Profile tab)

| Параметр                     | Описание                       |
| ---------------------------- | ------------------------------ |
| `can_provide_services`       | Может оказывать услуги         |
| `can_manage_location_schedule` | Может управлять расписанием |

Optimistic update: при переключении сразу обновляет кэш всех запросов `["employees"]`, откатывает при ошибке.

## DropdownMenu (`employee-row-actions.tsx`)

| Пункт           | Условие отображения                  | Действие              |
| --------------- | ------------------------------------ | --------------------- |
| View Profile    | всегда                               | открыть drawer        |
| Change Role     | owner + не сам себя                  | Dialog: select role   |
| Transfer        | owner + network-план                 | Dialog: select location |
| ---             | —                                    | separator             |
| Deactivate      | не solo-план + активен               | Dialog подтверждения  |
| Activate        | не solo-план + неактивен             | Dialog подтверждения  |

## Оптимистичные обновления

Хелпер `optimisticUpdateEmployee` в `user-staff.ts`:
- При мутации (permissions, activate, deactivate, role) — мгновенно обновляет все кэши `["employees"]`
- `selectedEmployee` в `staff-content.tsx` — **derived state** из `data.employees`, а не `useState` — гарантирует актуальность данных в drawer после optimistic update

## Пагинация (`pagination.tsx`)

Показывает в одном блоке:
- Строка «Показано X-Y из Z» + кнопки «<» / «>» / «X из Y»
- Строка «X / Y лимит сотрудников» (если `max = null` → «∞»)

## API эндпоинты

| Метод  | URL                                  | Описание                  |
| ------ | ------------------------------------ | ------------------------- |
| GET    | /api/v1/employees                    | Список с фильтрами        |
| POST   | /api/v1/employees/invite             | Приглашение               |
| PUT    | /api/v1/employees/{id}/permissions   | Смена ABAC-прав           |
| PUT    | /api/v1/employees/{id}/role          | Смена роли                |
| PUT    | /api/v1/employees/{id}/location      | Трансфер в другую локацию |
| POST   | /api/v1/employees/{id}/activate      | Активация                 |
| POST   | /api/v1/employees/{id}/deactivate    | Деактивация               |
| GET    | /api/v1/employees/{id}/services      | Услуги сотрудника         |

### Параметры GET /employees

| Параметр     | Тип             | Описание                               |
| ------------ | --------------- | -------------------------------------- |
| `search`     | string          | ILIKE по имени / фамилии / телефону    |
| `role`       | TUserRole[]     | Фильтр по роли                         |
| `active`     | boolean         | Фильтр по статусу активности           |
| `location_id`| string (UUID)   | Фильтр по локации (network)            |
| `order_by`   | field name      | Поле сортировки                        |
| `sort_order` | asc / desc      | Направление сортировки                 |
| `limit`      | number          | Размер страницы (default 10)           |
| `offset`     | number          | Смещение для пагинации                 |

## Ролевая модель — ограничения UI

| Действие            | Owner | Manager | Staff |
| ------------------- | ----- | ------- | ----- |
| Видеть список       | ✓     | ✓       | ✗     |
| Пригласить          | ✓     | ✗       | ✗     |
| Сменить роль        | ✓     | ✗       | ✗     |
| Трансфер (network)  | ✓     | ✗       | ✗     |
| Активация/деактивация| ✓ (не solo) | ✗ | ✗  |
| Управлять правами   | ✓     | ✓       | ✗     |

## i18n ключи (messages/ru.json, kz.json)

Все ключи в `Staff.*`:
- `Staff.filters.*` — поиск, фильтры
- `Staff.roles.*` — owner, manager, staff
- `Staff.drawer.*` — все тексты drawer (профиль, статусы, права, модалки)
- `Staff.pagination.*` — тексты пагинации
