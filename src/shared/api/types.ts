/**
 * Базовые типы для API
 * Определяют структуру запросов и ответов
 */

// Базовый тип для API ответа
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Тип для ошибки API (базовый интерфейс)
export interface ApiErrorData {
  message: string;
  status: number;
  code?: string;
}

// Типы для авторизации
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: {
    phone: string;
    name: string;
    role: string;
  };
  message: string;
}

export interface RefreshResponse {
  user: {
    id: string;
    phone: string;
    name: string;
    role: string;
  };
}

// Типы для пользователя
export interface User {
  id: string;
  phone: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Типы для приглашений
export interface InviteRequest {
  phone: string;
  role?: string;
  message?: string;
}

export interface InviteResponse {
  inviteId: string;
  phone: string;
  role: string;
  message?: string;
  expiresAt: string;
}

// Типы для записей на прием
export interface AppointmentRequest {
  date: string;
  time: string;
  service: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Базовые параметры для пагинации
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
