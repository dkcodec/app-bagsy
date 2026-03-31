# API Endpoints

Базовый URL: `NEXT_PUBLIC_API_URL` (например `https://api.bagsy.kz`)
Авторизация: `Authorization: Bearer <access_token>` (помечено как 🔒)
Swagger: `https://stage-backoffice.bagsy.kz/swagger/doc.json`

---

## Auth

### `POST /api/v1/auth/login`

Вход сотрудника по телефону и паролю.

```
Request:  { phone: string, password: string }
Response: { access_token: string, refresh_token: string }
Errors:   400, 401, 500
```

### `POST /api/v1/auth/logout`

Инвалидация refresh-токена.

```
Request:  { refresh_token: string }
Response: 204 No Content
Errors:   400, 500
```

### `POST /api/v1/auth/refresh`

Ротация токенов. ⚠️ Обязательно `Content-Type: application/json`.

```
Request:  { refresh_token: string }
Response: { access_token: string, refresh_token: string }
Errors:   400, 401, 500
```

### `POST /api/v1/auth/register`

⚠️ Только лендинг (bagsy.kz), НЕ в ЛК.

```
Request:  { phone, password, organization_name }
Response: { registration_id, retry_after }
Errors:   400, 409, 500
```

### `POST /api/v1/auth/register/verify`

⚠️ Только лендинг.

```
Request:  { phone, otp_code }
Response: { access_token, refresh_token }
```

### `POST /api/v1/auth/register/resend`

⚠️ Только лендинг.

```
Request:  { phone }
Response: { retry_after }
```

### `GET /api/v1/auth/verify/{token}`

Проверка action-токена (инвайт, сброс пароля).

```
Params:   token (path)
Response: { phone, purpose, org_id, location_id }
Errors:   400, 404, 500
```

### `POST /api/v1/auth/password/reset`

Запрос сброса пароля (отправляет ссылку).

```
Request:  { phone }
Response: { message }
Errors:   400, 403, 404, 500
```

### `POST /api/v1/auth/password/reset/confirm`

Подтверждение сброса пароля.

```
Request:  { token, new_password }
Response: { message }
Errors:   400, 401, 500
```

---

## Appointments (бронирования)

### `POST /api/v1/appointments`

Создание записи на услугу (требует OTP-подтверждения).

```
Request:  { client_phone, location_id, employee_id, service_id, date, time }
Response: { appointment_id, status: "pending" }
Errors:   400, 409, 500
```

### `POST /api/v1/appointments/slots`

Получение доступных слотов, сгруппированных по сотрудникам.

```
Request:  { location_id, service_id, date_from, date_to }
Response: { slots: [{ employee_id, employee_name, price, slots: [{ start_at, end_at }] }] }
Errors:   400, 404, 500
```

### 🔒 `POST /api/v1/appointments/direct`

Прямое создание записи сотрудником (без OTP, сразу confirmed).

```
Request:  { client_phone, location_id, employee_id, service_id, date, time }
Response: { appointment_id, status: "confirmed" }
Errors:   400, 401, 403, 409, 500
```

### 🔒 `GET /api/v1/appointments/calendar`

Календарь записей за период (макс. 35 дней).

```
Params:   from (required), to (required), location_id?, employee_id?, include_cancelled?
Response: {
  calendar: [{
    appointment_id, status, start_at, end_at, duration_minutes, price,
    service_id, service_name, service_color,
    employee_id, employee_name,
    location_id, location_name,
    customer_id, customer_name, customer_phone, customer_comment
  }]
}
Errors:   400, 401, 403, 500
```

### `POST /api/v1/appointments/{id}/confirm`

Подтверждение записи OTP-кодом.

```
Params:   id (path)
Request:  { otp_code: string }
Response: 204 No Content
Errors:   400, 404, 500
```

### 🔒 `POST /api/v1/appointments/{id}/cancel`

Отмена записи (только сотрудники).

```
Params:   id (path)
Request:  { cancellation_reason?: string }
Response: 204 No Content
Errors:   400, 403, 404, 500
```

### `POST /api/v1/appointments/{id}/resend-otp`

Повторная отправка OTP подтверждения.

```
Params:   id (path)
Response: 204 No Content
Errors:   400, 404, 500
```

---

## Employees

### 🔒 `GET /api/v1/employees`

Список сотрудников с фильтрацией и пагинацией.

```
Params:   location_id?, role[]?, search?, active?, limit?, offset?, order_by?, sort_order?
Response: { employees: [IEmployeeDto], total: number }
Errors:   400, 401, 403, 500
```

### 🔒 `GET /api/v1/employees/me`

Текущий авторизованный сотрудник.

```
Response: {
  id, phone, first_name, last_name, avatar_url, role,
  organization_id, location_id, active, created_at,
  permissions: { can_provide_services, can_manage_location_schedule }
}
```

### 🔒 `PUT /api/v1/employees/me`

Обновление своего профиля.

```
Request:  { first_name?, last_name?, avatar_id? }
Response: IEmployeeDto
Errors:   400, 401, 404, 410, 500
```

### 🔒 `POST /api/v1/employees/invite`

Приглашение сотрудника.

```
Request:  { phone, first_name, last_name, role: "manager"|"staff", location_id }
Response: { invitation_id, retry_after }
Errors:   400, 401, 403, 409, 429, 500
```

### `POST /api/v1/employees/invite/confirm`

Подтверждение приглашения + установка пароля.

```
Request:  { token, password }
Response: { access_token, refresh_token, employee }
Errors:   400, 404, 409, 410, 500
```

### 🔒 `POST /api/v1/employees/invite/resend`

Повторная отправка приглашения.

```
Request:  { phone }
Response: { retry_after }
Errors:   400, 401, 403, 404, 429, 500
```

### 🔒 `POST /api/v1/employees/{id}/activate`

Активация сотрудника. Owner — любого, Manager — staff своей локации.

```
Params:   id (path, UUID)
Response: 200
Errors:   403, 404, 500
```

### 🔒 `POST /api/v1/employees/{id}/deactivate`

Деактивация сотрудника. Только Owner.

```
Params:   id (path, UUID)
Response: 200
Errors:   403, 404, 500
```

### 🔒 `PATCH /api/v1/employees/{id}/role`

Смена роли. Только Owner.

```
Params:   id (path, UUID)
Request:  { role: "owner"|"manager"|"staff" }
Response: 200
Errors:   400, 403, 404, 500
```

### 🔒 `PATCH /api/v1/employees/{id}/permissions`

Смена разрешений. Owner — любому, Manager — staff своей локации.

```
Params:   id (path, UUID)
Request:  { can_provide_services?, can_manage_location_schedule? }
Response: 200
Errors:   403, 404, 500
```

### 🔒 `POST /api/v1/employees/{id}/transfer`

Перевод сотрудника в другую локацию. Только Owner.

```
Params:   id (path, UUID)
Request:  { location_id }
Response: 200
Errors:   400, 403, 404, 500
```

### 🔒 `GET /api/v1/employees/{id}/services`

Список услуг сотрудника с индивидуальными ценами.

```
Params:   id (path, UUID)
Response: { services: [{ service_id, service_name, price, ... }] }
Errors:   400, 404, 500
```

---

## Locations

### 🔒 `GET /api/v1/locations`

Список локаций организации.

```
Params:   active?, limit?, offset?, order_by?, sort_order?
Response: { locations: [ILocationDto], total }
Errors:   400, 401, 403, 500
```

### 🔒 `GET /api/v1/locations/{id}`

Получение локации по ID.

```
Params:   id (path, UUID)
Response: ILocationDto {
  id, name, description, phone, slug, category_id,
  schedule_type, slot_duration_minutes, active, created_at,
  address: { city, street, building, details },
  coordinates: { latitude, longitude }
}
```

### 🔒 `POST /api/v1/locations`

Создание локации.

```
Request: {
  name, description?, phone, category_id,
  latitude, longitude,
  schedule_type: "mixed"|"fixed",
  slot_duration_minutes: 5|10|15|30|60,
  address: { city, street, building, details? }
}
Response: { id, ... }
Errors:   400, 401, 403, 500
```

### 🔒 `PUT /api/v1/locations/{id}`

Обновление локации.

```
Params:   id (path, UUID)
Request:  { name?, description?, phone?, address?, ... }
Response: ILocationDto
```

### 🔒 `DELETE /api/v1/locations/{id}`

Удаление локации.

```
Params:   id (path, UUID)
Response: 204 No Content
```

### `GET /api/v1/locations/categories`

Категории бизнеса для создания локации.

```
Response: { categories: [{ id, name, slug, sort_order }] }
```

---

## Services

### 🔒 `GET /api/v1/services/{location_id}`

Список услуг локации.

```
Params:   location_id (path, UUID)
Response: { services: [{
  id, name, description, category_id, color,
  duration_minutes, min_price, max_price, sort_order, active
}] }
```

### 🔒 `POST /api/v1/services`

Создание услуги.

```
Request:  { name, description?, location_id, category_id, subcategory_id?, duration_minutes, color }
Response: { id, ... }
```

### 🔒 `PUT /api/v1/services/{id}`

Обновление услуги.

```
Params:   id (path, UUID)
Request:  { name?, description?, duration_minutes?, color?, ... }
Response: serviceResponse
```

### 🔒 `DELETE /api/v1/services/{id}`

Удаление услуги.

```
Params:   id (path, UUID)
Response: 204 No Content
```

### `GET /api/v1/service-categories`

Дерево категорий услуг по типу бизнеса.

```
Params:   location_category_id (UUID)
Response: { categories: [{ id, name, sort_order, children: [...] }] }
```

---

## Employee Services

### 🔒 `POST /api/v1/employee-services`

Привязка сотрудника к услуге с индивидуальной ценой.

```
Request:  { employee_id, service_id, price }
Response: { id }
Errors:   400, 403, 404, 422, 500
```

---

## Schedules

### 🔒 `GET /api/v1/employee-schedules/{employeeID}`

Расписание сотрудника за период.

```
Params:   employeeID (path, UUID), start (YYYY-MM-DD), end (YYYY-MM-DD)
Response: { slots: [{ date, is_working, ranges: [{ start, end }], breaks: [{ start, end }] }] }
```

### 🔒 `PUT /api/v1/employee-schedules/{employeeID}`

Установка расписания сотрудника (заменяет все слоты за период).

```
Params:   employeeID (path, UUID)
Request:  { start, end, slots: [{ date, is_working, ranges, breaks }] }
Response: 204 No Content
Errors:   400, 401, 403, 404, 422, 500
```

### 🔒 `DELETE /api/v1/employee-schedules/{employeeID}`

Удаление расписания сотрудника за период.

```
Params:   employeeID (path, UUID), start (YYYY-MM-DD), end (YYYY-MM-DD)
Response: 204 No Content
```

### 🔒 `GET /api/v1/location-schedules/{locationID}`

Расписание локации за период.

```
Params:   locationID (path, UUID), start (YYYY-MM-DD), end (YYYY-MM-DD)
Response: { slots: [...] }
```

### 🔒 `PUT /api/v1/location-schedules/{locationID}`

Установка расписания локации.

```
Params:   locationID (path, UUID)
Request:  { start, end, slots: [...] }
Response: 204 No Content
```

### 🔒 `DELETE /api/v1/location-schedules/{locationID}`

Удаление расписания локации за период.

```
Params:   locationID (path, UUID), start (YYYY-MM-DD), end (YYYY-MM-DD)
Response: 204 No Content
```

---

## Media

### 🔒 `POST /api/v1/media/upload`

Генерация presigned URL для загрузки файла.

```
Request:  { filename, mime_type, purpose: "avatars"|"organizations"|"locations"|"services"|"service-categories", size_bytes }
Response: { asset_id, upload_url, upload_fields: Record<string, string> }
```

### 🔒 `POST /api/v1/media/{id}/confirm`

Подтверждение загрузки файла.

```
Params:   id (path, asset_id)
Response: 200
```

---

## Планы подписки (захардкожены на фронте)

| Plan    | Цена         | Точки | Мастера | Триал           |
| ------- | ------------ | ----- | ------- | --------------- |
| Solo    | 5 000 ₸/мес  | 1     | 1       | 2 мес бесплатно |
| Point   | 9 000 ₸/мес  | 1     | до 10   | 1 мес бесплатно |
| Network | 25 000 ₸/мес | ∞     | ∞       | 1 мес бесплатно |

⚠️ API для подписок/оплат пока нет. Оплата производится вручную через WhatsApp.
