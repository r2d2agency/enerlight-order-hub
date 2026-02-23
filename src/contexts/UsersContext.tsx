import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { userService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    if (currentUser?.role !== 'admin') { setLoading(false); return; }
    userService.list()
      .then(data => setUsers(data))
      .catch((err) => {
        console.error('Erro ao carregar usuários da API:', err);
        toast.error('Erro ao carregar usuários do servidor.');
      })
      .finally(() => setLoading(false));
  }, [token, currentUser?.role]);

  const addUser = async (data: Omit<User, 'id'> & { password: string }) => {
    const created = await userService.create(data);
    setUsers(prev => [...prev, created]);
    toast.success('Usuário criado!');
  };

  const updateUser = async (id: string, data: Partial<User> & { password?: string }) => {
    await userService.update(id, data);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    toast.success('Usuário atualizado!');
  };

  const deleteUser = async (id: string) => {
    await userService.delete(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('Usuário removido!');
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, loading }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);
