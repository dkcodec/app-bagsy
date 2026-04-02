# ФЛОУ: SOLO (Самозанятый)

## Регистрация

Frontend (bagsy.kz/register?plan=solo):

- ФИО (required)
- Телефон (required, маска +7)
- Пароль (required)
- Подтверждение OTP кода

Backend автоматически создает:

- ✓ User
- ✓ Organization (tier: SOLO, owner_id: user.id, name: NULL)
- ✓ Employee (role: owner, **can_provide_services: true**)
- ✓ Триал (trial_ends_at: now() + 2 months)

Редирект: app.bagsy.kz/onboarding

---

## Онбординг: Создание локации

Frontend форма:

- Название локации (required)
- Категория деятельности (required, select из `GET /api/v1/locations/categories`)
- Описание (optional)
- Адрес (optional, автокомплит) — можно не указывать для онлайн/выезда
- Расписание работы (required): дни недели + время + длина слота

⚠️ **Для SOLO: чекбокс "Я сам оказываю услуги" СКРЫТ** (can_provide_services уже true)
⚠️ **schedule_type всегда `fixed`** (расписания синхронизируются автоматически на беке)

Backend создает:

- ✓ Location (organization_id, name, category_id, address)
- ✓ LocationSchedule (расписание локации)
- ✓ EmployeeSchedule (автоматически копирует расписание на owner-employee)

Редирект: app.bagsy.kz/onboarding/add-services

---

## Онбординг: Добавление услуг

Frontend форма (минимум 1 услуга):

- Название услуги (required)
- Цена (required, number, ₸)
- Длительность (required, number, минуты)
- Категория услуги (required, select из `GET /api/v1/service-categories?location_category_id=`)
- Описание (optional)

Backend создает:

- ✓ Service (location_id, name, price, duration, category_id)
- ✓ EmployeeService (service_id, employee_id=owner) — привязка к owner через `POST /api/v1/employee-services`

Редирект: app.bagsy.kz/dashboard

---

## Управление расписанием (в ЛК)

Frontend (app.bagsy.kz/schedule):

- Solo plan → табов нет, единственный scope = "point"
- Владелец редактирует расписание локации напрямую
- Календарная сетка + правая панель (мобилка: bottom sheet)
- Пресеты: 5/2, чётные, нечётные дни
- Подробнее: `docs/SCHEDULE_PAGE.md`

## Синхронизация расписаний (SOLO)

- При изменении расписания **локации** → автоматически обновляется расписание owner-employee
- При изменении расписания **owner-employee** → автоматически обновляется расписание локации
- Двусторонняя синхронизация только для SOLO

---

## Запись клиента (лендинг)

URL: bagsy.kz/{locale}/appointment/{location_id}

1. Выбор услуги (карточки с ценой и длительностью)
2. Выбор даты (календарь)
3. Выбор времени (слоты из `POST /api/v1/bookings/slots`)
4. Мастер определен автоматически (для SOLO только owner)
5. Данные клиента: ФИО, телефон, комментарий
6. Подтверждение OTP кода

Backend: `POST /api/v1/bookings` → Appointment (employee_id=owner, location_id, service_id)
