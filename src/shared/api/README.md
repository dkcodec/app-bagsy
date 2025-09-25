# API Integration с Tanstack Query

## Обзор

Интеграция Tanstack Query для работы с бэкендом, настроенная для работы с httpOnly cookies и автоматической обработки ошибок.

## Структура

```
src/shared/api/
├── types.ts          # Типы для API запросов и ответов
├── client.ts         # Базовый API клиент
├── services.ts       # Сервисы для конкретных эндпоинтов
└── index.ts          # Централизованные экспорты

src/shared/hooks/
├── use-auth.ts       # Хуки для авторизации
├── use-appointments.ts # Хуки для записей на прием
├── use-invites.ts    # Хуки для приглашений
└── index.ts          # Централизованные экспорты

src/providers/
└── query-provider.tsx # Провайдер Tanstack Query
```

## Использование

### 1. Авторизация

```tsx
import { useAuth, useLogin, useLogout } from "@/src/shared/hooks";

function LoginComponent() {
  const login = useLogin();
  const { user, isAuthenticated } = useAuth();

  const handleLogin = async credentials => {
    try {
      await login.mutateAsync(credentials);
      // Автоматический редирект на /dashboard
    } catch (error) {
      // Обработка ошибок
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Добро пожаловать, {user?.name}!</p>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  );
}
```

### 2. Записи на прием

```tsx
import { useUserAppointments, useCreateAppointment } from "@/src/shared/hooks";

function AppointmentsPage() {
  const { data: appointments, isLoading } = useUserAppointments();
  const createAppointment = useCreateAppointment();

  const handleCreate = async appointmentData => {
    try {
      await createAppointment.mutateAsync(appointmentData);
      toast.success("Запись создана!");
    } catch (error) {
      toast.error("Ошибка создания записи");
    }
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div>
      {appointments?.data.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
      <CreateAppointmentForm onSubmit={handleCreate} />
    </div>
  );
}
```

### 3. Приглашения

```tsx
import { useInviteByToken, useAcceptInvite } from "@/src/shared/hooks";

function InvitePage({ token }) {
  const { data: invite, isLoading } = useInviteByToken(token);
  const acceptInvite = useAcceptInvite();

  const handleAccept = async userData => {
    try {
      await acceptInvite.mutateAsync({ token, userData });
      toast.success("Приглашение принято!");
    } catch (error) {
      toast.error("Ошибка принятия приглашения");
    }
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (!invite) return <div>Приглашение не найдено</div>;

  return (
    <div>
      <h1>Приглашение для {invite.email}</h1>
      <AcceptInviteForm onSubmit={handleAccept} />
    </div>
  );
}
```

## Настройки

### Переменные окружения

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Конфигурация QueryClient

- **staleTime**: 5 минут (время жизни кэша)
- **gcTime**: 10 минут (время до удаления из кэша)
- **retry**: 3 попытки для запросов, 1 для мутаций
- **refetchOnWindowFocus**: false (экономия трафика)
- **refetchOnReconnect**: true (обновление при восстановлении соединения)

## Особенности

1. **Автоматическая обработка httpOnly cookies** - клиент автоматически отправляет cookies
2. **Типизация** - полная типизация всех запросов и ответов
3. **Обработка ошибок** - централизованная обработка ошибок API
4. **Кэширование** - умное кэширование с автоматической инвалидацией
5. **DevTools** - React Query DevTools в development режиме
6. **SSR поддержка** - настроено для работы с Next.js SSR

## Расширение

Для добавления новых эндпоинтов:

1. Добавьте типы в `types.ts`
2. Создайте методы в соответствующих сервисах в `services.ts`
3. Создайте хуки в `hooks/use-[entity].ts`
4. Экспортируйте в `index.ts`

## Пример добавления нового сервиса

```tsx
// types.ts
export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// services.ts
export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>("/notifications");
    return response.data;
  },
};

// hooks/use-notifications.ts
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
    staleTime: 1 * 60 * 1000, // 1 минута
  });
}
```
