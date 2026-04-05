# Страница расписания (/schedule)

Управление графиком работы сотрудников и локаций. Доступна из сайдбара.

---

## Архитектура

```
app/[locale]/(sidebar)/schedule/   — страница
src/features/schedule/
├── schedule-page-client.tsx       — обёртка: загрузка user + location(s), permissions, skeleton
├── schedule-content.tsx           — основной layout: табы, навигация, календарь + editor
├── schedule-header.tsx            — заголовок + Select локации (network plan)
├── schedule-scope-context.tsx     — контекст: scope (point|staff), locationId, scheduleType
├── api/
│   └── use-month-schedule.ts      — React Query хук: GET/PUT/DELETE schedule за месяц
└── ui/
    ├── month-grid.tsx             — календарная сетка 7×N с визуальными состояниями
    ├── schedule-editor.tsx        — правая панель: редактор расписания выбранных дней
    ├── schedule-presets.tsx        — пресеты (5/2, чётные, нечётные)
    ├── schedule-bottom-sheet.tsx   — Vaul Drawer (мобильный editor)
    ├── schedule-skeleton.tsx       — скелетоны календаря и editor
    └── time-range-row.tsx         — строка времени (start–end + удаление)
```

Хук прав: `src/shared/hooks/use-schedule-permissions.ts`

---

## Scope и права доступа

Два scope: **point** (расписание локации) и **staff** (личный график сотрудника).

### Определение прав (`useSchedulePermissions`)

| План / Тип                | Табы          | point scope                                         | staff scope                                 |
| ------------------------- | ------------- | --------------------------------------------------- | ------------------------------------------- |
| **Solo**                  | Скрыты        | Полный доступ (единственный scope)                  | —                                           |
| **Fixed** (point/network) | point + staff | Редактируемый (если `can_manage_location_schedule`) | Read-only (показывает расписание точки)     |
| **Mixed** (point/network) | point + staff | Редактируемый (если `can_manage_location_schedule`) | Редактируемый (если `can_provide_services`) |

- Solo plan определяется по `user.organization.subscription.plan === "solo"`
- При fixed + staff scope — информер "Ваш график определяется расписанием точки"
- `schedule_type` берётся из `GET /api/v1/locations/{id}`

### Выбор локации (Network plan)

Для плана **network** (несколько точек) в header показывается Select с локациями:

- `useLocations()` загружает список (только для owner)
- Select отображается если `plan === "network"` и `locations.length > 1`
- По умолчанию выбрана `user.location_id`
- При смене локации — пересчитывается `schedule_type`, сбрасываются выбранные дни, перезагружается расписание
- `locationId` передаётся через `ScheduleScopeContext` в `ScheduleContent`

---

## Календарная сетка (MonthGrid)

### Визуальные состояния ячеек

| Состояние                       | Стили                                                   |
| ------------------------------- | ------------------------------------------------------- |
| Рабочий день (есть расписание)  | `bg-accent-50/80 border-accent-200` (голубой фон)       |
| Выходной (Сб/Вс без расписания) | `bg-muted/50` (серый фон)                               |
| Прошедший день                  | `opacity-40 pointer-events-none`                        |
| Выбранный                       | `border-2 border-accent-500` (синяя рамка, без заливки) |
| Сегодня                         | `font-semibold`, цвет accent                            |
| Обычный будний без расписания   | `border-border bg-card`                                 |

### Адаптивность

- **Мобилка**: однобуквенные дни (П, В, С...), компактное время "9-18", `min-h-[44px]`
- **Десктоп**: полные сокращения (Пн, Вт, Ср...), время "09–18", `min-h-[56px]`

### Взаимодействие

- **Клик** — toggle выбора дня (прошедшие дни заблокированы)
- **Shift+клик** — выбор диапазона от последнего выбранного
- Автоматическое открытие закрытых дней при выборе (дефолт 09:00–18:00)
- `autoOpenedDaysRef` отслеживает авто-открытые дни для отката при deselect (включая shift+клик и пресеты)

---

## Редактор расписания (ScheduleEditor)

Правая панель / мобильный bottom sheet.

### Заголовок

- Мелко: "Выбрано: N дн."
- Крупнее (при single select): "Вторник, 31 марта"
- Badge "Своё" — только для mixed staff scope, когда расписание сотрудника отличается от расписания точки (не показывается при редактировании точки)

### Содержимое

- **Рабочие интервалы** — список TimeRangeRow (start–end), кнопка "Добавить интервал"
- **Перерывы** — аналогичный список
- Предупреждение если у выбранных дней разное время (mixed times warning)
- Если день закрыт — сообщение + кнопка "Сделать рабочим"

### Кнопки

- **Сохранить** (`size="lg"`) — видна только при `isDirty`, показывает count при multi-select
- **Выходной** — кнопка `variant="outline"` destructive, сразу сохраняет на бэк (без необходимости жать "Сохранить")

---

## Пресеты (SchedulePresets)

| Пресет      | Логика                                      |
| ----------- | ------------------------------------------- |
| 5/2 (Пн–Пт) | Будни — рабочие (09–18), выходные — закрыты |
| Чётные      | Чётные дни — рабочие, нечётные — закрыты    |
| Нечётные    | Нечётные дни — рабочие, чётные — закрыты    |

- На мобилке — горизонтальный скролл (`overflow-x-auto flex-nowrap`)
- На десктопе — flex-wrap + подсказка "Shift+клик для выделения диапазона"
- После применения пресета на мобилке — автоматически открывается bottom sheet
- Пресеты регистрируют рабочие дни в `autoOpenedDaysRef` через `onMarkAutoOpened` — при deselect без сохранения дни откатываются
- Скрыты в read-only режиме

---

## Мобильная адаптация

- **Десктоп**: два столбца `grid-cols-[1fr_280px]`, editor в sticky Card
- **Мобилка**: один столбец, editor в Vaul Drawer (bottom sheet с handle bar, `max-h-[80vh]`)
- Drawer открывается при выборе дня или пресета, закрывается при сбросе выделения
- `DrawerTitle className="sr-only"` для a11y (Radix требует DialogTitle)

---

## Валидация

При сохранении (`handleSave`) проверяется **только для изменённых (dirty) дней**:

1. **end <= start** — время окончания раньше или равно началу → toast `endBeforeStart`
2. **Пересечение рабочих интервалов** → toast `overlappingRanges`
3. **Перерыв вне рабочих часов** — перерыв не помещается внутрь ни одного рабочего интервала → toast `breakOutsideWork`
4. **Пересечение перерывов** → toast `overlappingBreaks`

`validateSchedule(schedule, days?)` принимает опциональный фильтр дней. Нетронутые дни не валидируются — это избегает ложных ошибок из-за round-trip маппинга.

Toast-уведомления через Sonner: `savedSuccess`, `savedError`, `dayOffSuccess`.

---

## Данные

### useMonthSchedule

Хук загружает расписание за месяц, предоставляет `save()` для PUT и навигацию по месяцам.

- Scope `"point"` → `GET/PUT /api/v1/location-schedules/{locationID}`
- Scope `"staff"` → `GET/PUT /api/v1/employee-schedules/{employeeID}`
- Параметры `start` / `end` — первый и последний день месяца (`YYYY-MM-DD`)

### Partial save (dirty days)

`save(data, days?)` отправляет **только изменённые дни**:
- `start`/`end` сужается до `min(days)..max(days)` — API перезаписывает только этот диапазон
- Слоты фильтруются по указанным дням
- `dirtyDaysRef` в `schedule-content.tsx` трекает какие дни менялись (через `markDirty`)
- Если `days` не указан — отправляется весь месяц (fallback)

### Round-trip маппинг

При отправке на бэк `splitWorkByBreaks()` разрезает work-ranges по перерывам:
`work 9-18 + break 13-14` → `[work 9-13, rest 13-14, work 14-18]`

При загрузке обратно `mergeAdjacentWork()` склеивает обратно:
`[work 9-13, work 14-18] + break 13-14` → `[work 9-18]` + `break 13-14`

Склеивание происходит **только** если промежуток между work-ranges точно совпадает с break. Два независимых work-range (например `9-13` и `15-18` без break в промежутке) остаются как есть.

### Dual fetch для mixed staff

При `activeScope === "staff"` и `schedule_type === "mixed"` — дополнительный запрос расписания точки для определения badge "Своё" (кастомный override).

### Локальный стейт

`localSchedule` — копия серверных данных для редактирования. Синхронизируется с сервером при загрузке и смене месяца.

`dirtyDaysRef: Set<number>` трекает номера изменённых дней. `isDirty` — derived state (`dirtyDaysRef.current.size > 0`). При сохранении/сбросе/sync — очищается через `clearDirty()`.

---

## Скелетоны

- `ScheduleCalendarSkeleton` — сетка 7×5 с skeleton-ячейками
- `ScheduleEditorSkeleton` — Card с skeleton-линиями (заголовок, время, кнопка)
- Показываются при загрузке user/location и при загрузке расписания месяца

---

## i18n ключи

Namespace `Schedule`:

- `pointSchedule`, `mySchedule` — табы
- `selectedDay`, `selectedDays` — подзаголовок editor
- `shiftHint` — подсказка Shift+клик (desktop)
- `saveCount` — кнопка "Сохранить (N)"
- `dayOff` — кнопка "Выходной"
- `customBadge` — badge "Своё"
- `fixedScheduleInfo` — информер fixed schedule
- `savedSuccess`, `savedError`, `dayOffSuccess` — toast
- `Editor.endBeforeStart`, `Editor.overlappingRanges`, `Editor.breakOutsideWork` — ошибки валидации
- `Presets.weekdays`, `Presets.evenDays`, `Presets.oddDays` — пресеты
- `Weekdays.mon`..`sun` — дни недели
