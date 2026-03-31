# Account Page — Страница аккаунта

Единая страница `/account` объединяет профиль и настройки. Доступна по клику на аватар в сайдбаре.

---

## Роут

```
app/[locale]/(sidebar)/account/page.tsx → src/features/account/account-page.tsx
```

## Структура файлов

```
src/features/account/
├── account-page.tsx              # Главная страница с табами
├── index.ts                      # Barrel export
└── tabs/
    ├── index.ts                  # Barrel export табов
    ├── profile-tab.tsx           # Личные данные, бизнес, аккаунт
    ├── subscription-tab.tsx      # Подписка и планы
    ├── security-tab.tsx          # Пароль, сессии, выход
    └── appearance-tab.tsx        # Тема, язык, уведомления
```

---

## Табы

### 1. Profile (Профиль)

| Секция | Что показывает | Действия |
| --- | --- | --- |
| Аватар + имя | Фото, ФИО, роль | Редактирование имени, загрузка/удаление фото (S3 presigned URL) |
| Личная информация | ФИО, телефон, роль | Inline-редактирование ФИО (react-hook-form + Zod) |
| Бизнес | Локация (название + мелкий ID), Organization ID | Копирование ID в буфер. Название подтягивается через `useLocation(location_id)` |
| Аккаунт | Дата создания, дата обновления | Кнопка «Удалить аккаунт» (presentational) |

**Хуки:** `useCurrentUser`, `useUpdateAccount`, `useMediaUpload`, `useDeleteAvatar`, `useLocation`

### 2. Subscription (Подписка)

Данные планов захардкожены на фронте (3 плана):

| План | Цена | Триал | Лимиты |
| --- | --- | --- | --- |
| Solo | 5 000 ₸/мес | 2 мес бесплатно | 1 точка, 1 мастер |
| Point | 9 000 ₸/мес | 1 мес бесплатно | 1 точка, до 10 мастеров |
| Network | 25 000 ₸/мес | 1 мес бесплатно | ∞ точек, ∞ мастеров |

Содержит:
- Текущий план + статистика использования (локации, сотрудники)
- Toggleable сравнительная таблица планов с фичами
- Баннер «оплата вручную через менеджера»
- Таблица истории платежей (пока пустая)
- Способ оплаты (placeholder)

**Данные подписки:** берутся из `user.subscription_limit` (тип `ISubscriptionLimit`)

### 3. Security (Безопасность)

| Секция | Описание |
| --- | --- |
| Пароль | Кнопка «Сменить пароль» → `usePasswordChangeRequest` (отправляет SMS-код) |
| Активные сессии | Текущая сессия + пример другой (presentational) |
| Выход | `useLogout` — выход из аккаунта |

### 4. Appearance (Внешний вид)

| Секция | Описание |
| --- | --- |
| Тема | Light / Dark / System — карточки через `next-themes`, с hydration guard |
| Язык | Русский / Қазақша — переключение через `next/navigation` router с сохранением `?tab=` |
| Уведомления | Push (через Service Worker + VAPID), SMS (включены), Email digest (выключен) |

---

## URL-синхронизация табов

Активный таб хранится в URL query param `?tab=`:

```
/account              → Profile (по умолчанию, без ?tab=)
/account?tab=subscription
/account?tab=security
/account?tab=appearance
```

**Механизм:**
- `useState` инициализируется из `useSearchParams().get("tab")`
- При смене таба — `window.history.replaceState()` обновляет URL без навигации
- При смене языка в Appearance — `?tab=` пробрасывается в новый URL

Это решает проблему сброса таба при смене локали (вызывает полную перезагрузку страницы).

---

## i18n

Переводы в `messages/ru.json` и `messages/kz.json` в namespace `Account`:

```
Account.title
Account.tabs.{profile,subscription,security,appearance}
Account.Profile.*
Account.Subscription.*
Account.Security.*
Account.Appearance.*
```

---

## Скелетоны

Каждый таб (кроме Appearance) имеет собственный скелетон-компонент:
- `ProfileTabSkeleton` — аватар, секции с полями
- `SubscriptionTabSkeleton` — карточки статистики, таблица
- `SecurityTabSkeleton` — секции пароля и сессий

Appearance использует hydration guard (`mounted` state) для темы вместо скелетона.

---

## Удалённые файлы

При создании Account были удалены:
- `app/[locale]/(sidebar)/settings/` — старая страница настроек
- `src/features/settings/` — старый feature настроек
- `src/features/profile/` — старый feature профиля
- `src/widgets/ui/theme-toggle.tsx` — вынесен в appearance-tab
- Из сайдбара убран пункт «Settings» (`app-sidebar.tsx`)
