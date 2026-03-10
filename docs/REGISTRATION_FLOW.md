# ТЗ: Регистрация владельца (Owner Registration)

**Проект:** Bagsy  
**Фича:** REG-001 &#8212; Регистрация владельца бизнеса  
**Версия:** 3.0 (финал)  
**Дата:** 15.02.2026

---

## 1. Краткое описание

Владелец салона/самозанятый выбирает тариф на лендинге bagsy.kz и регистрируется. Система в одной транзакции создаёт пользователя, организацию и подписку. После регистрации владелец попадает в админку app.bagsy.kz.

**Scope:** Только регистрация владельцев (owner). Мастера добавляются через invite-флоу (отдельная фича).

---

## 2. User Flow

```
bagsy.kz (лендинг)
    │
    ├─ Выбирает тариф &#8594; &#171;Попробовать бесплатно&#187;
    │  &#8594; /register?plan=solo|point|network
    │
    ├─ Или /register (без query)
    │
    &#9660;
bagsy.kz/register?plan={plan_code}
    │
    ├─ Есть ?plan &#8594; тариф предвыбран (можно сменить)
    ├─ Нет ?plan &#8594; селектор тарифа в форме
    │
    ├─ Форма:
    │   &#8226; Телефон (+7 ___ ___ __ __)      [required]
    │   &#8226; Имя                              [required]
    │   &#8226; Фамилия                          [optional]
    │   &#8226; Пароль                           [required, min 6]
    │   &#8226; Подтвердите пароль               [только фронт, на бэк не шлём]
    │   &#8226; Тариф                            [required]
    │
    │  Валидация фронт: zod
    │  На бэк: phone (без +), first_name, last_name, password, plan_code
    │
    ├─ POST /api/v1/auth/register
    │
    ├─ форма с OTP для подтверждения номера
    │
    ├─ POST api/v1/auth/register/verify
    │

    &#9660;
Успех &#8594; Редирект app.bagsy.kz
    │
    &#9660;
Дашборд &#8594; &#171;Создайте вашу первую точку&#187;
```

---

## 3. API-контракт

### `POST /api/v1/auth/register`

**Request:**

```json
{
  "phone": "77001234567",
  "first_name": "Айгуль",
  "last_name": "Сериков",
  "password": "mypass1",
  "plan_code": "solo"
}
```

**Валидация на бэкенде:**

| Поле         | Правила                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `phone`      | Required. Только цифры, 10&#8211;15 символов. Уникален среди `employees` с `is_active = true`. |
| `first_name` | Required. 1&#8211;100 символов. Trim пробелов.                                                 |
| `last_name`  | Optional. 0&#8211;100 символов. Trim пробелов.                                                 |
| `password`   | Required. Минимум 6 символов.                                                                  |
| `plan_code`  | Required. Существует в `plans` с `is_active = true`.                                           |

**Success (201):**

```json
{
  "message": "success"
}
```

**Errors:**

| Code | Ситуация          | Body                                                                        |
| ---- | ----------------- | --------------------------------------------------------------------------- |
| 400  | Невалидные данные | `{ "error": "validation_error", "details": { "phone": "invalid_format" } }` |
| 409  | Телефон занят     | `{ "error": "phone_already_exists" }`                                       |
| 422  | Тариф не найден   | `{ "error": "invalid_plan" }`                                               |

---

## 4. Бэкенд: одна транзакция

Всё создаётся **в одной транзакции**. Если любой шаг падает &#8212; полный rollback, ничего не создано.

```
BEGIN;

1. Проверить уникальность телефона
2. Хешировать пароль (bcrypt, cost 10)
3. INSERT organization (owner_id = NULL)        &#8594; org_id
4. INSERT employee (organization_id = org_id)   &#8594; employee_id
5. UPDATE organization SET owner_id = employee_id
6. INSERT subscription (trial)
7. INSERT employees_work_history

COMMIT;

8. Сгенерировать JWT tokens (вне транзакции)
```

### Шаг 3: Organization

```sql
INSERT INTO organizations (owner_id, name, description, slug, is_active)
VALUES (NULL, NULL, NULL, NULL, true)
RETURNING id;
```

### Шаг 4: Employee (owner)

```sql
INSERT INTO employees (
  phone, password_hash, first_name, last_name,
  organization_id, location_id,
  role, can_provide_services, is_active
) VALUES (
  '77001234567', '$2a$10$...', 'Айгуль', 'Сериков',
  :org_id, NULL,
  'owner', false, true
) RETURNING id;
```

### Шаг 5: Связать owner

```sql
UPDATE organizations SET owner_id = :employee_id WHERE id = :org_id;
```

### Шаг 6: Subscription (trial)

```sql
INSERT INTO subscriptions (
  organization_id, plan_id, billing_cycle,
  recurring_amount,
  current_period_start, current_period_end,
  trial_ends_at, next_billing_at
) VALUES (
  :org_id, :plan_id, 'monthly',
  :plan_price_monthly,
  NOW(), NOW() + INTERVAL '2 months',
  NOW() + INTERVAL '2 months',
  NOW() + INTERVAL '2 months'
);
```

### Шаг 7: Work history

```sql
INSERT INTO employees_work_history (
  employee_id, organization_id, role, joined_at
) VALUES (:employee_id, :org_id, 'owner', NOW());
```

### Шаг 8: JWT tokens (вне транзакции)

```json
{
  "sub": "employee_id",
  "org": "organization_id",
  "role": "owner"
}
```

---

## 5. Миграции

### 5.1. `employees.organization_id` &#8594; NULLABLE

```sql
-- Было:
organization_id UUID NOT NULL REFERENCES organizations(id),
-- Стало:
organization_id UUID REFERENCES organizations(id),
```

> Хоть в регистрации мы ставим org_id сразу, nullable нужен для invite-флоу: мастер создаётся по инвайту и может временно быть без организации.

### 5.2. `employees.location_id` &#8594; NULLABLE

```sql
-- Было:
location_id UUID NOT NULL REFERENCES locations(id),
-- Стало:
location_id UUID REFERENCES locations(id),
```

> Owner при регистрации не имеет точки. Привязка к точке &#8212; отдельный шаг.

---

## 6. Бизнес-правила

| Правило                    | Описание                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Уникальность телефона      | Только среди `is_active = true`. Уволенный сотрудник с тем же номером не блокирует регистрацию.                             |
| Пароль                     | bcrypt cost 10+. Plaintext не логируется.                                                                                   |
| Телефон в БД               | Хранится без &#171;+&#187;, только цифры: `77001234567`                                                                     |
| Триал                      | 2 месяца, стартует при регистрации. Полный функционал тарифа.                                                               |
| Org без имени              | `name`, `slug`, `description` = NULL. Заполняются позже в админке (для Network &#8212; обязательно при создании 2-й точки). |
| Owner can_provide_services | По умолчанию `false`. Включается при создании точки (чекбокс &#171;Я сам оказываю услуги&#187;).                            |
| Rate limit                 | 5 req/min с одного IP на `/auth/register`.                                                                                  |

---

## 7. Дашборд после регистрации (контекст для фронта)

| Условие                                                           | Подсказка                              |
| ----------------------------------------------------------------- | -------------------------------------- |
| `locations.count == 0`                                            | &#171;Создайте вашу первую точку&#187; |
| `locations.count > 0 && services.count == 0`                      | &#171;Добавьте услуги&#187;            |
| `services.count > 0 && employees.count == 1 && plan &#8800; solo` | &#171;Пригласите мастеров&#187;        |

---

## 8. Тест-кейсы

### Happy Path

1. &#9989; Регистрация с `?plan=solo` &#8594; 201, всё создано
2. &#9989; Регистрация без query, тариф в body &#8594; 201
3. &#9989; Автологин после регистрации, JWT валиден
4. &#9989; Organization создана с `owner_id`, `name = NULL`
5. &#9989; Subscription создана с `trial_ends_at = NOW() + 2 months`

### Валидация

6. &#10060; Телефон с буквами &#8594; 400
7. &#10060; Телефон 8 цифр &#8594; 400
8. &#10060; Пароль 5 символов &#8594; 400
9. &#10060; `first_name` пустое &#8594; 400
10. &#10060; `plan_code` несуществующий &#8594; 422

### Конфликты

11. &#10060; Тот же телефон (active employee) &#8594; 409
12. &#9989; Телефон уволенного (`is_active = false`) &#8594; 201

### Транзакционность

13. &#9989; Если INSERT subscription падает &#8594; employee и organization откатываются
14. &#9989; После rollback можно зарегаться повторно (ничего не осталось)

### Безопасность

15. &#9989; Пароль = bcrypt hash в БД
16. &#9989; 6-й запрос за минуту &#8594; 429

---

## 9. Зависимости

| Зависимость                                    | Блокирует? |
| ---------------------------------------------- | ---------- |
| Seed data: таблица `plans` заполнена           | Да         |
| Миграция: `employees.organization_id` nullable | Да         |
| Миграция: `employees.location_id` nullable     | Да         |
| JWT-инфраструктура                             | Да         |

---

## 10. Seed Data

```sql
INSERT INTO plans (code, name, description, price_monthly, price_annual, sort_order, is_active)
VALUES
  ('solo',    'Solo',    'Для самозанятых мастеров',       5000.00, 48000.00,  1, true),
  ('point',   'Point',   'Для одной точки с сотрудниками', 9000.00, 86400.00,  2, true),
  ('network', 'Network', 'Для сети из нескольких точек',  25000.00, 240000.00, 3, true);

INSERT INTO plan_capabilities (plan_id, feature, limit_value) VALUES
  ((SELECT id FROM plans WHERE code = 'solo'), 'max_locations', 1),
  ((SELECT id FROM plans WHERE code = 'solo'), 'max_employees', 1),
  ((SELECT id FROM plans WHERE code = 'solo'), 'max_services', -1),
  ((SELECT id FROM plans WHERE code = 'solo'), 'online_booking', NULL),
  ((SELECT id FROM plans WHERE code = 'solo'), 'whatsapp_notifications', NULL),

  ((SELECT id FROM plans WHERE code = 'point'), 'max_locations', 1),
  ((SELECT id FROM plans WHERE code = 'point'), 'max_employees', 10),
  ((SELECT id FROM plans WHERE code = 'point'), 'max_services', -1),
  ((SELECT id FROM plans WHERE code = 'point'), 'online_booking', NULL),
  ((SELECT id FROM plans WHERE code = 'point'), 'whatsapp_notifications', NULL),
  ((SELECT id FROM plans WHERE code = 'point'), 'client_base', NULL),
  ((SELECT id FROM plans WHERE code = 'point'), 'analytics_basic', NULL),

  ((SELECT id FROM plans WHERE code = 'network'), 'max_locations', -1),
  ((SELECT id FROM plans WHERE code = 'network'), 'max_employees', -1),
  ((SELECT id FROM plans WHERE code = 'network'), 'max_services', -1),
  ((SELECT id FROM plans WHERE code = 'network'), 'online_booking', NULL),
  ((SELECT id FROM plans WHERE code = 'network'), 'whatsapp_notifications', NULL),
  ((SELECT id FROM plans WHERE code = 'network'), 'client_base', NULL),
  ((SELECT id FROM plans WHERE code = 'network'), 'analytics_advanced', NULL),
  ((SELECT id FROM plans WHERE code = 'network'), 'multi_location_management', NULL);
```

---

## 11. Вне scope

- Логин &#8212; отдельная фича
- Refresh tokens &#8212; отдельная фича
- Сброс пароля &#8212; отдельная фича
- Создание точки &#8212; отдельная фича
- Invite-флоу мастеров &#8212; отдельная фича
- B2C-регистрация клиентов (OTP) &#8212; отдельная фича
- Upgrade/downgrade тарифа &#8212; отдельная фича
