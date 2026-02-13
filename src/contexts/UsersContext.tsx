import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { userService } from '@/services';

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

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.list()
      .then(data => setUsers(data))
      .catch(() => { /* API unavailable, keep empty */ })
      .finally(() => setLoading(false));
  }, []);

  const addUser = async (data: Omit<User, 'id'> & { password: string }) => {
    try {
      const created = await userService.create(data);
      setUsers(prev => [...prev, created]);
    } catch {
      setUsers(prev => [...prev, { id: crypto.randomUUID(), name: data.name, email: data.email, role: data.role, active: data.active }]);
    }
  };

  const updateUser = async (id: string, data: Partial<User> & { password?: string }) => {
    try {
      await userService.update(id, data);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, loading }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);
