import { api } from './api';
import { Product, Client, Order, User } from '@/types';

// Auth
export const authService = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};

// Products
export const productService = {
  list: () => api.get<Product[]>('/products'),
  create: (data: Omit<Product, 'id'>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Clients
export const clientService = {
  list: () => api.get<Client[]>('/clients'),
  create: (data: Omit<Client, 'id'>) => api.post<Client>('/clients', data),
  update: (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Orders
export const orderService = {
  list: () => api.get<Order[]>('/orders'),
  create: (data: Omit<Order, 'id'>) => api.post<Order>('/orders', data),
  update: (id: string, data: Partial<Order>) => api.put<Order>(`/orders/${id}`, data),
};

// Users (admin)
export const userService = {
  list: () => api.get<User[]>('/users'),
  create: (data: Omit<User, 'id'> & { password: string }) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
