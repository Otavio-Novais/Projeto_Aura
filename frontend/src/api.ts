const API_BASE = 'http://localhost:8000/api';

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  const mergedHeaders = {
    ...headers,
    ...((options?.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      message = `Erro ${response.status}`;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function apiGet<T>(url: string): Promise<T> {
  return request<T>(url);
}

export function apiPost<T>(url: string, data: unknown): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiPut<T>(url: string, data: unknown): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function apiDelete(url: string): Promise<void> {
  return request<void>(url, { method: 'DELETE' });
}
