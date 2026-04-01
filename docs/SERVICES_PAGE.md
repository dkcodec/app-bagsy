# Services Page

Страница управления услугами локации (`/[locale]/services`).

## Доступ

- **Owner** — видит все локации, может выбрать локацию (network-план)
- **Manager** — видит только свою локацию
- **Staff** — нет доступа

## Компоненты

```
app/[locale]/(sidebar)/services/page.tsx
  └── ServicesHeader + ServicesContent

src/features/services/
  services-header.tsx          — заголовок с SidebarTrigger
  services-content.tsx         — оркестратор (данные, состояние drawer)
  components/
    service-list.tsx           — таблица с группировкой по категориям
    service-row.tsx            — строка услуги (grid layout)
    service-row-actions.tsx    — DropdownMenu (⋯): Edit, Staff, Duplicate, Delete
    service-drawer.tsx         — адаптивный drawer: Sheet (right) на десктопе, Vaul bottom-sheet на мобилке
    service-details-tab.tsx    — таб "Детали" — форма редактирования (PUT)
    service-staff-tab.tsx      — таб "Сотрудники" — привязка мастеров
    delete-service-dialog.tsx  — диалог подтверждения удаления
    add-service-dialog.tsx     — диалог создания новой услуги
    add-service-form.tsx       — форма создания услуги
    location-select.tsx        — селектор локации (network)
    error-message.tsx          — ошибки загрузки
```

## Interaction

1. **Таблица** — grid-layout, группировка по category_id. Клик по строке → Sheet (Details tab)
2. **Drawer** — адаптивный: Sheet (right) на десктопе / Vaul bottom-sheet на мобилке, два таба:
   - **Details** — редактирование name, description, duration, color, sort_order (PUT /api/v1/services/{id})
   - **Staff** — привязка сотрудников (POST /api/v1/employee-services), отвязка (DELETE — TODO, эндпоинт скоро)
3. **DropdownMenu (⋯)** — Edit, Manage staff, Duplicate, Delete
4. **Delete** — Dialog с подтверждением → DELETE /api/v1/services/{id}
5. **Duplicate** — POST /api/v1/services с "(copy)" в имени

## API эндпоинты

| Метод  | URL                            | Описание                       |
| ------ | ------------------------------ | ------------------------------ |
| GET    | /api/v1/services/{locationId}  | Список услуг локации           |
| POST   | /api/v1/services               | Создание услуги                |
| PUT    | /api/v1/services/{id}          | Обновление (все поля optional) |
| DELETE | /api/v1/services/{id}          | Soft-delete                    |
| POST   | /api/v1/employee-services      | Привязка сотрудника            |
| DELETE | /api/v1/employee-services/{id} | Отвязка (TODO)                 |

## Локация

- **solo/point** — одна локация, автоматически выбрана
- **network** — Owner видит Select с локациями организации
