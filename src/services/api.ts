const API_URL = import.meta.env.VITE_API_URL || 'https://whats-agente-order-enerlight-backend.isyhhh.easypanel.host/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('enerlight-token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    localStorage.removeItem('enerlight-token');
    localStorage.removeItem('enerlight-user');
    // Let React (ProtectedRoute/AuthContext) handle redirect naturally
    throw new Error('Sessão expirada');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  
  // Upload with FormData (for images)
  upload: <T>(path: string, formData: FormData) => {
    const token = localStorage.getItem('enerlight-token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return res.json() as Promise<T>;
    });
  },
};
