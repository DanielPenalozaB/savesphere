import { authState } from '$lib/auth.svelte.js';

/**
 * Typed fetch wrapper for API calls.
 * Authentication is handled via httpOnly cookies (credentials: 'include').
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
};

export type ApiResult<T> = {
  data?: T;
  error?: string;
  status?: number;
};

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json'
  };
}

function handleUnauthorized(status?: number) {
  if (status === 401) {
    authState.logout();
  }
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(),
    credentials: 'include'
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    handleUnauthorized(res.status);
    return { error: json.message || `API error: ${res.status}`, status: res.status };
  }

  return { data: json.data as T, status: res.status };
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
    credentials: 'include'
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    handleUnauthorized(res.status);
    return { error: json.message || `API error: ${res.status}`, status: res.status };
  }

  return { data: json.data as T, status: res.status };
}

export async function apiPut<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
    credentials: 'include'
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    handleUnauthorized(res.status);
    return { error: json.message || `API error: ${res.status}`, status: res.status };
  }

  return { data: json.data as T, status: res.status };
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    handleUnauthorized(res.status);
    return { error: json.message || `API error: ${res.status}`, status: res.status };
  }

  return { data: json.data as T, status: res.status };
}

export async function apiPatch<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
    credentials: 'include'
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    handleUnauthorized(res.status);
    return { error: json.message || `API error: ${res.status}`, status: res.status };
  }

  return { data: json.data as T, status: res.status };
}
