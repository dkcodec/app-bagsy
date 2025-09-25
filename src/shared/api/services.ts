/**
 * API сервисы для работы с конкретными эндпоинтами
 * Содержит методы для авторизации, пользователей, приглашений и записей
 */

import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  User,
  InviteRequest,
  InviteResponse,
  AppointmentRequest,
  Appointment,
  PaginationParams,
  PaginatedResponse,
} from "./types";

/**
 * Сервис для работы с авторизацией
 */
export const authService = {
  /**
   * Вход в систему
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "v1/auth/login",
      credentials
    );
    return response.data;
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    await apiClient.post("v1/auth/logout");
  },

  /**
   * Обновление токена
   */
  async refresh(): Promise<RefreshResponse> {
    const response = await apiClient.post<RefreshResponse>("v1/auth/refresh");
    return response.data;
  },

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("v1/auth/me");
    return response.data;
  },
};

/**
 * Сервис для работы с пользователями
 */
export const userService = {
  /**
   * Получение списка пользователей с пагинацией
   */
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";

    const response = await apiClient.get<PaginatedResponse<User>>(endpoint);
    return response.data;
  },

  /**
   * Получение пользователя по ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Удаление пользователя
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

/**
 * Сервис для работы с приглашениями
 */
export const inviteService = {
  /**
   * Создание приглашения
   */
  async createInvite(data: InviteRequest): Promise<InviteResponse> {
    const response = await apiClient.post<InviteResponse>("/invites", data);
    return response.data;
  },

  /**
   * Получение приглашения по токену
   */
  async getInviteByToken(token: string): Promise<InviteResponse> {
    const response = await apiClient.get<InviteResponse>(`/invites/${token}`);
    return response.data;
  },

  /**
   * Принятие приглашения
   */
  async acceptInvite(
    token: string,
    userData: { name: string; password: string }
  ): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      `/invites/${token}/accept`,
      userData
    );
    return response.data;
  },

  /**
   * Получение списка приглашений
   */
  async getInvites(
    params?: PaginationParams
  ): Promise<PaginatedResponse<InviteResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/invites?${queryString}` : "/invites";

    const response =
      await apiClient.get<PaginatedResponse<InviteResponse>>(endpoint);
    return response.data;
  },

  /**
   * Отмена приглашения
   */
  async cancelInvite(id: string): Promise<void> {
    await apiClient.delete(`/invites/${id}`);
  },
};

/**
 * Сервис для работы с записями на прием
 */
export const appointmentService = {
  /**
   * Создание записи на прием
   */
  async createAppointment(data: AppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment>("/appointments", data);
    return response.data;
  },

  /**
   * Получение записей пользователя
   */
  async getUserAppointments(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Appointment>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/appointments?${queryString}`
      : "/appointments";

    const response =
      await apiClient.get<PaginatedResponse<Appointment>>(endpoint);
    return response.data;
  },

  /**
   * Получение записи по ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Обновление записи
   */
  async updateAppointment(
    id: string,
    data: Partial<AppointmentRequest>
  ): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(
      `/appointments/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Отмена записи
   */
  async cancelAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(
      `/appointments/${id}/cancel`
    );
    return response.data;
  },

  /**
   * Получение всех записей (для администраторов)
   */
  async getAllAppointments(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Appointment>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/admin/appointments?${queryString}`
      : "/admin/appointments";

    const response =
      await apiClient.get<PaginatedResponse<Appointment>>(endpoint);
    return response.data;
  },
};
