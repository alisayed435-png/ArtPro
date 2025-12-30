/**
 * API Client for Calyx Command
 * 
 * This module provides a typed API client for all backend endpoints.
 * In production, this would connect to real APIs. For demo purposes,
 * requests are intercepted by MSW (Mock Service Worker).
 */

import type {
  User,
  Organization,
  Order,
  OrderFilters,
  Artwork,
  ArtworkFilters,
  ArtworkUploadPayload,
  ComplianceStatus,
  ComplianceEvent,
  AnalyticsData,
  SystemStatus,
  Activity,
  PaginatedResponse,
  SortConfig,
} from './types';

const API_BASE_URL = '/api';

// ============================================================================
// HTTP Client Helpers
// ============================================================================

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// Auth API
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  organization: Organization;
  token: string;
}

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: (): Promise<void> =>
    request('/auth/logout', { method: 'POST' }),

  getCurrentUser: (): Promise<{ user: User; organization: Organization }> =>
    request('/auth/me'),

  initDemoMode: (): Promise<AuthResponse> =>
    request('/auth/demo', { method: 'POST' }),
};

// ============================================================================
// Orders API
// ============================================================================

export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  filters?: OrderFilters;
  sort?: SortConfig;
}

export const ordersApi = {
  getOrders: (params: GetOrdersParams = {}): Promise<PaginatedResponse<Order>> => {
    const queryString = buildQueryString({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...params.filters,
      sort: params.sort,
    });
    return request(`/orders${queryString}`);
  },

  getOrderById: (id: string): Promise<Order> =>
    request(`/orders/${id}`),

  createOrder: (data: Partial<Order>): Promise<Order> =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOrder: (id: string, data: Partial<Order>): Promise<Order> =>
    request(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  cancelOrder: (id: string): Promise<Order> =>
    request(`/orders/${id}/cancel`, { method: 'POST' }),

  reorder: (id: string): Promise<Order> =>
    request(`/orders/${id}/reorder`, { method: 'POST' }),
};

// ============================================================================
// Artwork API
// ============================================================================

export interface GetArtworkParams {
  page?: number;
  pageSize?: number;
  filters?: ArtworkFilters;
  sort?: SortConfig;
}

export const artworkApi = {
  getArtwork: (params: GetArtworkParams = {}): Promise<PaginatedResponse<Artwork>> => {
    const queryString = buildQueryString({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...params.filters,
      sort: params.sort,
    });
    return request(`/artwork${queryString}`);
  },

  getArtworkById: (id: string): Promise<Artwork> =>
    request(`/artwork/${id}`),

  uploadArtwork: async (payload: ArtworkUploadPayload): Promise<Artwork> => {
    // In a real app, this would upload to S3/cloud storage
    // For demo, we simulate the upload
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    formData.append('productType', payload.productType);

    const response = await fetch(`${API_BASE_URL}/artwork/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  approveArtwork: (id: string, comment?: string): Promise<Artwork> =>
    request(`/artwork/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  requestChanges: (id: string, comment: string): Promise<Artwork> =>
    request(`/artwork/${id}/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  rejectArtwork: (id: string, comment: string): Promise<Artwork> =>
    request(`/artwork/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  deleteArtwork: (id: string): Promise<void> =>
    request(`/artwork/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// Compliance API
// ============================================================================

export interface GetComplianceEventsParams {
  page?: number;
  pageSize?: number;
  type?: string[];
  severity?: string[];
  dateRange?: { start: string; end: string };
}

export const complianceApi = {
  getStatus: (): Promise<ComplianceStatus> =>
    request('/compliance/status'),

  getEvents: (params: GetComplianceEventsParams = {}): Promise<PaginatedResponse<ComplianceEvent>> => {
    const queryString = buildQueryString({
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      ...params,
    });
    return request(`/compliance/events${queryString}`);
  },

  getEventById: (id: string): Promise<ComplianceEvent> =>
    request(`/compliance/events/${id}`),

  syncNow: (): Promise<{ success: boolean; message: string }> =>
    request('/compliance/sync', { method: 'POST' }),

  resolveEvent: (id: string): Promise<ComplianceEvent> =>
    request(`/compliance/events/${id}/resolve`, { method: 'POST' }),
};

// ============================================================================
// Analytics API
// ============================================================================

export interface AnalyticsParams {
  [key: string]: unknown;
  dateRange?: string | { start: string; end: string };
  productType?: string[];
  location?: string[];
}

export const analyticsApi = {
  getDashboard: (params: AnalyticsParams = {}): Promise<AnalyticsData> => {
    const queryString = buildQueryString(params as Record<string, unknown>);
    return request(`/analytics/dashboard${queryString}`);
  },

  getOrderAnalytics: (params: AnalyticsParams = {}) => {
    const queryString = buildQueryString(params as Record<string, unknown>);
    return request(`/analytics/orders${queryString}`);
  },

  getRevenueAnalytics: (params: AnalyticsParams = {}) => {
    const queryString = buildQueryString(params as Record<string, unknown>);
    return request(`/analytics/revenue${queryString}`);
  },
};

// ============================================================================
// System Status API
// ============================================================================

export const systemApi = {
  getStatus: (): Promise<SystemStatus> =>
    request('/system/status'),

  getIncidents: (): Promise<{ incidents: SystemStatus['incidents'] }> =>
    request('/system/incidents'),

  getEvents: (): Promise<{ events: Activity[] }> =>
    request('/system/events'),

  subscribeToUpdates: (callback: (status: SystemStatus) => void) => {
    // Simulate WebSocket-like updates
    const intervalId = setInterval(async () => {
      try {
        const status = await systemApi.getStatus();
        callback(status);
      } catch {
        // Ignore errors in polling
      }
    }, 10000);

    return () => clearInterval(intervalId);
  },
};

// ============================================================================
// Activity API
// ============================================================================

export const activityApi = {
  getRecentActivity: (limit = 10): Promise<Activity[]> =>
    request(`/activity/recent?limit=${limit}`),
};

// ============================================================================
// Demo API
// ============================================================================

export const demoApi = {
  seedData: (): Promise<{ success: boolean }> =>
    request('/demo/seed', { method: 'POST' }),

  resetData: (): Promise<{ success: boolean }> =>
    request('/demo/reset', { method: 'POST' }),
};
