import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { userService } from '@/services';

const STORAGE_KEY = 'enerlight-users';

const DEFAULT_ADMIN: User = { id: '1', name: 'Admin Enerlight', email: 'admin@enerlight.com.br', role: 'admin', active: true };

interface UsersContextType {
  users: User[];
  addUser: (data: Omit<User, 'id'> & { password: string }) => void;
  updateUser: (id: string, data: Partial<User> & { password?: string }) => void;
  deleteUser: (id: string) => void;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType>({
  users: [],
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  loading: true,
});

function loadFromStorage(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    // Ensure admin always exists
    if (!parsed.find((u: User) => u.email === 'admin@enerlight.com.br')) {
      parsed.unshift(DEFAULT_ADMIN);
    }
    return parsed;
  } catch { return [DEFAULT_ADMIN]; }
}

function saveToStorage(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(loadFromStorage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.list()
      .then(data => { setUsers(data); saveToStorage(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { saveToStorage(users); }, [users]);

  const addUser = async (data: Omit<User, 'id'> & { password: string }) => {
    try {
      const created = await userService.create(data);
      setUsers(prev => [...prev, created]);
    } catch {
      setUsers(prev => [...prev, { id: crypto.randomUUID(), name: data.name, email: data.email, role: data.role, active: data.active }]);
    }
  };

  const updateUser = async (id: string, data: Partial<User> & { password?: string }) => {
    try { await userService.update(id, data); } catch {}
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = async (id: string) => {
    try { await userService.delete(id); } catch {}
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, loading }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);
