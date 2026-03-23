import { apiClient } from './axios';

// User API
export const userApi = {
  get: (url: string) => apiClient.get(url) as any,
  post: (url: string, data?: any) => apiClient.post(url, data) as any,
  patch: (url: string, data?: any) => apiClient.patch(url, data) as any,
  delete: (url: string) => apiClient.delete(url) as any,
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats') as any,
  getCharts: (type: string, params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/dashboard/charts/${type}${queryString}`) as any;
  },
};

// Zone API
export const zoneApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/zones/admin${queryString}`) as any;
  },
  close: (id: string) => apiClient.patch(`/zones/admin/${id}/close`) as any,
  delete: (id: string) => apiClient.delete(`/zones/admin/${id}`) as any,
};

// Group API
export const groupApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/groups/admin${queryString}`) as any;
  },
  delete: (id: string) => apiClient.delete(`/groups/admin/${id}`) as any,
  getMessages: (id: string) => apiClient.get(`/groups/admin/${id}/messages`) as any,
};

// Message API
export const messageApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/messages/admin${queryString}`) as any;
  },
  delete: (id: string) => apiClient.delete(`/messages/admin/${id}`) as any,
};

// Report API
export const reportApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/reports${queryString}`) as any;
  },
  getById: (id: string) => apiClient.get(`/reports/${id}`) as any,
  resolve: (id: string, data: { resolutionNote: string }) => 
    apiClient.patch(`/reports/${id}`, data) as any,
};

// Leaderboard API
export const leaderboardApi = {
  getUsers: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/leaderboard/users${queryString}`) as any;
  },
};

// Tag API
export const tagApi = {
  getAll: () => apiClient.get('/tags') as any,
  create: (data: { name: string }) => apiClient.post('/tags', data) as any,
  update: (id: string, data: { name: string }) => apiClient.patch(`/tags/${id}`, data) as any,
  delete: (id: string) => apiClient.delete(`/tags/${id}`) as any,
};
