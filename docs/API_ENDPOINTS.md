# API Endpoints

Базовый URL: `NEXT_PUBLIC_API_URL` (например `https://api.bagsy.kz`)
Авторизация: `Authorization: Bearer <access_token>` (помечено как 🔒)

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
Request:  { phone, password, first_name, last_name, plan_code }
Response: { message, phone, expires_in, retry_after }
Errors:   400, 409, 500
```

### `POST /api/v1/auth/register/verify`

⚠️ Только лендинг.

```
Request:  { phone, code }
Response: { access_token, refresh_token }
```

### `POST /api/v1/auth/register/resend`

⚠️ Только лендинг.

```
Request:  { phone }
Response: { message, expires_in, retry_after }
```

### `GET /api/v1/auth/verify/{token}`

Проверка action-токена (инвайт, сброс пароля).

```
Params:   token (path)
Response: { phone, purpose, organization_id, location_id }
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
Response: { access_token, refresh_token }
Errors:   400, 401, 500
```

---

## Bookings

### `POST /api/v1/bookings`

Создание записи на услугу.

```
Request:  { phone, first_name, last_name, comment?, employee_id, location_id, service_id, start_at }
Response: { id: string }
Errors:   400, 409, 500
```

### `POST /api/v1/bookings/slots`

Получение доступных слотов.

```
Request:  { location_id, service_id, start_date, end_date, employee_id? }
Response: {
  location_id, service_id, duration_minutes,
  master_slots: [{ employee_id, employee_name, price, slots: [{ start_at, end_at }] }]
}
Errors:   400, 404, 500
```

### 🔒 `GET /api/v1/bookings/calendar`

Календарь записей за период.

```
Params:   from (required), to (required), location_id?, employee_id?, status?
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

### `POST /api/v1/bookings/{id}/confirm`

Подтверждение записи OTP-кодом.

```
Params:   id (path)
Request:  { code: string }
Response: 204 No Content
Errors:   400, 404, 500
```

### 🔒 `POST /api/v1/bookings/{id}/cancel`

Отмена записи.

```
Params:   id (path)
Request:  { reason?: string }
Response: 204 No Content
Errors:   400, 403, 404, 500
```

### `POST /api/v1/bookings/{id}/resend-otp`

Повторная отправка OTP подтверждения.

```
Params:   id (path)
Response: 204 No Content
Errors:   400, 404, 500
```

---

## Employees

### 🔒 `GET /api/v1/employees`

Список сотрудников с фильтрацией.

```
Params:   location_id?, role?, phone_search?, limit?, offset?
Response: { employees: [IEmployeeDto], total: number }
```

### 🔒 `GET /api/v1/employees/me`

Текущий сотрудник (замена `/users/me`).

```
Response: IEmployeeDto
```

### 🔒 `PUT /api/v1/employees/me`

Обновление профиля.

```
Request:  { first_name, last_name, avatar_id? }
Response: IEmployeeDto
```

### 🔒 `POST /api/v1/employees/invite`

Приглашение сотрудника.

```
Request:  { phone, first_name, last_name, role: "manager"|"staff", location_id }
Response: { message, phone, expires_in }
Errors:   400, 401, 403, 409, 429, 500
```

### `POST /api/v1/employees/invite/confirm`

Подтверждение приглашения + установка пароля.

```
Request:  { token, password }
Response: { access_token, refresh_token }
Errors:   400, 404, 409, 410, 500
```

### 🔒 `POST /api/v1/employees/invite/resend`

Повторная отправка приглашения.

```
Request:  { phone }
Response: { message, phone, expires_in, retry_after }
Errors:   400, 401, 403, 404, 429, 500
```

---

## Locations

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
Response: { id: string, prompt_org_profile: boolean }
Errors:   400, 403, 500
```

### 🔒 `GET /api/v1/locations`

Список локаций организации.

```
Response: { locations: [ILocationDto] }
```

### 🔒 `GET /api/v1/locations/{id}`

Получение локации по ID.

```
Response: ILocationDto
```

### `GET /api/v1/locations/categories`

Категории бизнеса для создания локации.

```
Response: { categories: [{ id: string, name: string, slug: string, sort_order: number }] }
```

---

## Services

### 🔒 `GET /api/v1/services/{location_id}`

Список услуг локации.

```
Response: { services: [IServiceDto] }
```

### 🔒 `POST /api/v1/services`

Создание услуги.

```
Request:  { name, description, location_id, category_id, subcategory_id?, duration_minutes, color }
Response: IServiceDto
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

Привязка сотрудника к услуге.

```
Request:  { employee_id: string, price: string, service_id: string }
Response: { id: string }
Errors:   400, 401, 403, 409, 500
```

---

## Media

### 🔒 `POST /api/v1/media/upload`

Загрузка медиафайла (аватар и т.д.).

```
Request:  FormData { file, purpose: "avatars" }
Response: { id: string, url: string }
```

### 🔒 `DELETE /api/v1/media/avatar`

Удаление аватара.

```
Response: 204 No Content
```
