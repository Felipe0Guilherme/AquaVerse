// src/api/services.ts
import { apiClient } from './client';
import type { User, AquariumLog, CreateLogPayload, UpdateLogPayload, LogsQueryParams, PaginatedResponse, DashboardStats } from '../types';

export const authApi = {
  register: async (payload: { email: string; password: string; username: string; full_name?: string }): Promise<{ user: User; token: string }> => {
    const { data } = await apiClient.post<{ success: boolean; data: User; token: string }>('/auth/register', payload);
    return { user: data.data!, token: data.token! };
  },

  login: async (payload: { email: string; password: string }): Promise<{ user: User; token: string }> => {
    const { data } = await apiClient.post<{ success: boolean; data: User; token: string }>('/auth/login', payload);
    return { user: data.data!, token: data.token! };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return data.data!;
  },
};

export const logsApi = {
  list: async (params?: LogsQueryParams): Promise<PaginatedResponse<AquariumLog>> => {
    const { data } = await apiClient.get<PaginatedResponse<AquariumLog>>('/logs', { params });
    return data;
  },

  getById: async (id: string): Promise<AquariumLog> => {
    const { data } = await apiClient.get<{ success: boolean; data: AquariumLog }>(`/logs/${id}`);
    return data.data!;
  },

  create: async (payload: CreateLogPayload): Promise<AquariumLog> => {
    const { data } = await apiClient.post<{ success: boolean; data: AquariumLog }>('/logs', payload);
    return data.data!;
  },

  update: async (id: string, payload: UpdateLogPayload): Promise<AquariumLog> => {
    const { data } = await apiClient.patch<{ success: boolean; data: AquariumLog }>(`/logs/${id}`, payload);
    return data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/logs/${id}`);
  },

  getStats: async (aquariumId?: string): Promise<DashboardStats> => {
    const { data } = await apiClient.get<{ success: boolean; data: DashboardStats }>('/logs/stats', {
      params: aquariumId ? { aquarium_id: aquariumId } : undefined,
    });
    return data.data!;
  },
};