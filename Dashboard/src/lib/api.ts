import { apiClient } from './axios';

// User API
export const userApi = {
  get: (url: string) => apiClient.get(url),
  patch: (url: string, data?: any) => apiClient.patch(url, data),
  delete: (url: string) => apiClient.delete(url),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getCharts: (type: string, params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/dashboard/charts/${type}${queryString}`);
  },
};

// Zone API
export const zoneApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/zones/admin${queryString}`);
  },
  close: (id: string) => apiClient.patch(`/zones/admin/${id}/close`),
  delete: (id: string) => apiClient.delete(`/zones/admin/${id}`),
};

// Group API
export const groupApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/groups/admin${queryString}`);
  },
  delete: (id: string) => apiClient.delete(`/groups/admin/${id}`),
  getMessages: (id: string) => apiClient.get(`/groups/admin/${id}/messages`),
};

// Message API
export const messageApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/messages/admin${queryString}`);
  },
  delete: (id: string) => apiClient.delete(`/messages/admin/${id}`),
};

// Report API
export const reportApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/reports${queryString}`);
  },
  getById: (id: string) => apiClient.get(`/reports/${id}`),
  resolve: (id: string, data: { resolutionNote: string }) => 
    apiClient.patch(`/reports/${id}`, data),
};

// Leaderboard API
export const leaderboardApi = {
  getUsers: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/leaderboard/users${queryString}`);
  },
};
