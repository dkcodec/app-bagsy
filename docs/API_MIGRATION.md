# API Migration: Старый → Новый (завершена)

## Изменения терминологии

| Старое                | Новое                    | Описание                     |
| --------------------- | ------------------------ | ---------------------------- |
| `points`              | `locations`              | Точки обслуживания → Локации |
| `point_code`          | `location_id` (UUID)     | Идентификатор локации        |
| `staff`               | `employees`              | Сотрудники                   |
| `master_phone`        | `employee_id` (UUID)     | Идентификатор сотрудника     |
| `bagsies`             | `bookings`               | Записи/бронирования          |
| `network_code`        | `organization_id` (UUID) | Идентификатор организации    |
| `pointCode` (JS/TS)   | `locationId`             | Переменные и пропы           |
| `selectedMasterPhone` | `selectedEmployeeId`     | Store/контекст календаря     |

## Изменения ролей

| Старые роли   | Новые роли                                          |
| ------------- | --------------------------------------------------- |
| `admin`       | ❌ удалена                                          |
| `net_manager` | ❌ удалена (заменена ABAC атрибутами)               |
| `self_owner`  | ❌ удалена                                          |
| `manager`     | `manager` ✅                                        |
| `staff`       | `staff` ✅                                          |
| —             | `owner` ✅ (новая, заменяет self_owner/net_manager) |

Вместо множества ролей используется **ABAC**: роль + атрибуты (`can_provide_services`, `can_manage_location_schedule`).

---

## Маппинг эндпоинтов

### Auth

| Старый путь                            | Новый путь                                 | Изменения                                                                     |
| -------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `POST v1/auth/login`                   | `POST /api/v1/auth/login`                  | ✅ без изменений                                                              |
| (не было)                              | `POST /api/v1/auth/logout`                 | **Новый**                                                                     |
| `POST v1/auth/refresh`                 | `POST /api/v1/auth/refresh`                | Добавлен `/api` prefix; обязателен `Content-Type: application/json`           |
| `GET v1/auth/verify-auth-token/:token` | `GET /api/v1/auth/verify/{token}`          | Убраны `point_code`/`network_code`, добавлены `organization_id`/`location_id` |
| `POST v1/auth/password/change`         | `POST /api/v1/auth/password/reset`         | `change` → `reset`                                                            |
| `POST v1/auth/password/change/confirm` | `POST /api/v1/auth/password/reset/confirm` | `password` → `new_password`                                                   |
| `POST v1/auth/staff/register/confirm`  | `POST /api/v1/employees/invite/confirm`    | Переехал из auth в employees                                                  |

### Bookings

| Старый путь              | Новый путь                              | Изменения                                                                              |
| ------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------- |
| `POST v1/bagsies/master` | `POST /api/v1/bookings`                 | `client_phone` → `phone`, `master_phone` → `employee_id`, добавлен `location_id`       |
| `GET v1/calendar`        | `GET /api/v1/bookings/calendar`         | `point_code` → `location_id`, `master_phone` → `employee_id`, плоская структура ответа |
| (не было)                | `POST /api/v1/bookings/slots`           | **Новый** — слоты                                                                      |
| (не было)                | `POST /api/v1/bookings/{id}/confirm`    | **Новый**                                                                              |
| (не было)                | `POST /api/v1/bookings/{id}/cancel`     | **Новый** ✅ реализован                                                                |
| (не было)                | `POST /api/v1/bookings/{id}/resend-otp` | **Новый**                                                                              |

### Employees

| Старый путь                           | Новый путь                              | Изменения                                                             |
| ------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| `POST v1/auth/staff/register`         | `POST /api/v1/employees/invite`         | `name/surname` → `first_name/last_name`, `point_code` → `location_id` |
| `POST v1/auth/staff/register/confirm` | `POST /api/v1/employees/invite/confirm` | `phone+password+token` → `token+password`                             |
| `GET v1/staff`                        | `GET /api/v1/employees`                 | Новый эндпоинт, params: `location_id`, `role`, `phone_search`         |
| `GET v1/users/me`                     | `GET /api/v1/employees/me`              | ✅ реализован                                                         |
| `PUT v1/users/me`                     | `PUT /api/v1/employees/me`              | ✅ реализован                                                         |

### Locations

| Старый путь           | Новый путь                                             | Изменения                                                             |
| --------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| `POST v1/points`      | `POST /api/v1/locations`                               | Новый request: `address {}`, `schedule_type`, `slot_duration_minutes` |
| `GET v1/points`       | `GET /api/v1/locations`                                | ✅ реализован                                                         |
| `GET v1/points/:code` | `GET /api/v1/locations/{id}`                           | ✅ реализован                                                         |
| (не было)             | `GET /api/v1/locations/categories`                     | **Новый** ✅ реализован                                               |
| (не было)             | `GET /api/v1/service-categories?location_category_id=` | **Новый** ✅ реализован                                               |

### Services

| Старый путь                   | Новый путь                           | Изменения                                               |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------- |
| `GET v1/services/:point_code` | `GET /api/v1/services/{location_id}` | UUID вместо кода                                        |
| `POST v1/services`            | `POST /api/v1/services`              | `location_id` вместо `point_code`, все ID строки (UUID) |
| `POST v1/master-services`     | `POST /api/v1/employee-services`     | `master_phone` → `employee_id`, `price` теперь string   |

### Media

| Старый путь            | Новый путь                    | Изменения               |
| ---------------------- | ----------------------------- | ----------------------- |
| `POST v1/media/upload` | `POST /api/v1/media/upload`   | ✅ реализован           |
| (не было)              | `DELETE /api/v1/media/avatar` | **Новый** ✅ реализован |

---

## Формат ответа календаря

### Старый (вложенный)

```json
{
  "data": [
    {
      "id": 1,
      "bagsy_info": { "client_phone": "...", "master_phone": "..." },
      "service_info": { "name": "...", "color": "..." },
      "start_at": "...",
      "end_at": "..."
    }
  ]
}
```

### Новый (плоский)

```json
{
  "calendar": [
    {
      "appointment_id": "uuid",
      "status": "confirmed",
      "start_at": "2025-01-25T14:00:00.000+05:00",
      "end_at": "2025-01-25T15:00:00.000+05:00",
      "duration_minutes": 60,
      "price": 5000,
      "service_id": "uuid",
      "service_name": "Стрижка",
      "service_color": "#FF5733",
      "employee_id": "uuid",
      "employee_name": "Анна",
      "location_id": "uuid",
      "location_name": "Салон на Абая",
      "customer_id": "uuid",
      "customer_name": "Иван",
      "customer_phone": "77001234567",
      "customer_comment": "..."
    }
  ]
}
```

---

## Типы schedule_type

| Значение | Описание                                                           |
| -------- | ------------------------------------------------------------------ |
| `fixed`  | Все сотрудники работают по расписанию локации (SOLO: всегда fixed) |
| `mixed`  | У локации своё расписание + у каждого сотрудника своё              |
