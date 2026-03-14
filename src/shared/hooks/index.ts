/**
 * Экспорты хуков
 * Централизованный импорт для всех хуков
 */

// Хуки авторизации
export * from "./use-auth";

// Хуки для мобильных устройств
export * from "./use-mobile";
// use-mobile-server экспортируется отдельно для server components

// Хуки для UI
export * from "./use-disclosure";
export * from "./use-update-event";

// Хуки для пользователей
export * from "./use-users";

// Медиа (загрузка аватара и др.)
export * from "./use-media-upload";

// Хуки для календаря
export * from "./use-calendar";

// Хуки для записей (bagsies)
export * from "./use-bagsies";

// Хуки для точек сети
export * from "./use-network-locations";

// Хуки для услуг
export * from "./use-services";

// Хуки для debounce
export * from "./use-debounce";

// Права на редактирование графика (точка/мастер)
export * from "./use-schedule-permissions";
