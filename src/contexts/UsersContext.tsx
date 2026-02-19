import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { userService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>(loadFromStorage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    userService.list()
      .then(data => { setUsers(data); saveToStorage(data); })
      .catch((err) => {
        console.error('Erro ao carregar usuários da API:', err);
        toast.error('Não foi possível conectar ao servidor. Usando dados locais.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { saveToStorage(users); }, [users]);

  const addUser = async (data: Omit<User, 'id'> & { password: string }) => {
    try {
      const created = await userService.create(data);
      setUsers(prev => [...prev, created]);
      toast.success('Usuário salvo no servidor!');
    } catch (err) {
      console.error('Erro ao salvar usuário na API:', err);
      toast.error('Erro ao salvar no servidor. Usuário salvo apenas localmente.');
      setUsers(prev => [...prev, { id: crypto.randomUUID(), name: data.name, email: data.email, role: data.role, active: data.active }]);
    }
  };

  const updateUser = async (id: string, data: Partial<User> & { password?: string }) => {
    try {
      await userService.update(id, data);
      toast.success('Usuário atualizado no servidor!');
    } catch (err) {
      console.error('Erro ao atualizar usuário na API:', err);
      toast.error('Erro ao atualizar no servidor.');
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
    } catch (err) {
      console.error('Erro ao remover usuário na API:', err);
      toast.error('Erro ao remover no servidor.');
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, loading }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);
