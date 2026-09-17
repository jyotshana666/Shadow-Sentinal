/**
 * Centralized API Client for Shadow Sentinel Frontend.
 * Handles authentication header injection, base URL configuration, and error responses.
 */

import { ErrorResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ss_jwt_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('ss_jwt_token');
      localStorage.removeItem('ss_user_info');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=true';
      }
      throw new Error('Authentication expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText,
        message: 'An unexpected server error occurred.',
        path: endpoint,
      }));

      const message = errorData.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Fetch')) {
      throw new Error('Network error: Unable to connect to Shadow Sentinel Backend API.');
    }
    throw error;
  }
}
