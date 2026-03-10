# ФЛОУ: POINT (Локация с несколькими мастерами)

## Регистрация

Frontend (bagsy.kz/register?plan=point):

- ФИО (required)
- Телефон (required, маска +7)
- Пароль (required)
- Подтверждение OTP кода

Backend автоматически создает:

- ✓ User
- ✓ Organization (tier: POINT, owner_id: user.id)
- ✓ Employee (role: owner, **can_provide_services: false** — по умолчанию)
- ✓ Триал (trial_ends_at: now() + 2 months)

Редирект: app.bagsy.kz/onboarding

---

## Онбординг: Создание локации

Frontend форма:

- Название локации (required)
- Категория деятельности (required, select из `GET /api/v1/locations/categories`)
- Описание (optional)
- Адрес (optional)
- Расписание работы (required): дни недели + время + длина слота
- **schedule_type**: `mixed` или `fixed`

✅ **Для POINT: чекбокс "Я сам оказываю услуги" ПОКАЗАН**

Backend создает (`POST /api/v1/locations`):

- ✓ Location (organization_id, name, category_id, schedule_type, slot_duration_minutes)
- ✓ LocationSchedule

Если чекбокс включен → `can_provide_services = true` для owner-employee

Редирект: app.bagsy.kz/onboarding/add-services

---

## Онбординг: Добавление услуг

Frontend форма:

- Название услуги (required)
- Цена (required, ₸)
- Длительность (required, минуты)
- Категория (required, select из `GET /api/v1/service-categories?location_category_id=`)
- Описание (optional)
- Если owner.can_provide_services: `[ ] Я оказываю эту услугу`

Backend создает (`POST /api/v1/services`):

- ✓ Service (location_id, name, duration, category_id)
- ✓ EmployeeService (service_id, employee_id=owner) — если чекбокс включен

Редирект: app.bagsy.kz/dashboard

---

## Добавление мастеров (в ЛК)

Frontend (app.bagsy.kz/staff → [Добавить сотрудника]):

- ФИО (required)
- Телефон (required)
- Роль: `manager` | `staff`
- Локация (select из списка локаций)

Backend (`POST /api/v1/employees/invite`):

- Отправляет ссылку-инвайт через WhatsApp: app.bagsy.kz/invite/{token}

---

## Запись клиента (лендинг)

URL: bagsy.kz/{location_id}

1. Выбор услуги
2. Выбор даты и времени (слоты из `POST /api/v1/bookings/slots`)
3. **Выбор мастера** (для POINT — из списка мастеров, оказывающих эту услугу)
4. Данные клиента: ФИО, телефон, комментарий
5. Подтверждение OTP

Backend: `POST /api/v1/bookings`
