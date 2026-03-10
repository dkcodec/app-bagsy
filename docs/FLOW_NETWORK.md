# ФЛОУ: NETWORK (Сеть локаций)

## Регистрация

Frontend (bagsy.kz/register?plan=network):
- ФИО (required)
- Телефон (required)
- Пароль (required)
- Подтверждение OTP кода

Backend автоматически создает:
- ✓ User
- ✓ Organization (tier: NETWORK, owner_id: user.id, name: NULL)
- ✓ Employee (role: owner, can_provide_services: false)
- ✓ Триал (trial_ends_at: now() + 2 months)

Редирект: app.bagsy.kz/onboarding

---

## Онбординг: Создание первой локации

Аналогично POINT. Backend: `POST /api/v1/locations`

Редирект → onboarding/add-services → dashboard

---

## Создание второй локации (триггер сети)

Frontend (app.bagsy.kz/locations → [+ Добавить локацию]):

Система проверяет:
```
if (tier == "NETWORK" && locations.count >= 1 && organization.name == NULL)
    → показать модалку "Создание сети"
```

Модалка:
```
┌────────────────────────────────────────────────┐
│ 🏢 СОЗДАНИЕ СЕТИ                               │
│                                                │
│ Вы создаете сеть точек. Дайте ей название:     │
│                                                │
│ Название сети (required)                       │
│ Описание сети (optional)                       │
│                                                │
│ [Отмена]  [Создать сеть и добавить локацию]    │
└────────────────────────────────────────────────┘
```

Backend обновляет Organization: name, description, network_slug

---

## Управление сетью (в ЛК)

Frontend (app.bagsy.kz/locations) — доступно только owner:

- Основная информация сети (название, описание)
- Статистика: количество локаций, сотрудников, записей, выручка
- Список всех локаций с кнопками управления
- [+ Добавить локацию] — до ~10 локаций

---

## Добавление сотрудников

Frontend (app.bagsy.kz/staff → [Добавить сотрудника]):
- ФИО, телефон
- Роль: `manager` (управляет локацией) | `staff` (оказывает услуги)
- Локация (select из `GET /api/v1/locations`)

Backend (`POST /api/v1/employees/invite`):
- Отправляет инвайт-ссылку: app.bagsy.kz/invite/{token}

---

## Запись клиента

URL: bagsy.kz/{location_id} — запись в конкретную локацию.
Флоу аналогичен POINT: выбор услуги → дата/время → мастер → данные → OTP.
