import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '@/types';
import { clientService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClientsContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, data: Omit<Client, 'id'>) => void;
  deleteClient: (id: string) => void;
  loading: boolean;
}

const ClientsContext = createContext<ClientsContextType>({
  clients: [],
  addClient: async () => ({ id: '', name: '', cnpj: '', address: '', neighborhood: '', city: '', state: '', phone: '', email: '' }),
  updateClient: () => {},
  deleteClient: () => {},
  loading: true,
});

export function ClientsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    clientService.list()
      .then(data => setClients(data))
      .catch((err) => {
        console.error('Erro ao carregar clientes da API:', err);
        toast.error('Erro ao carregar clientes do servidor.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const addClient = async (data: Omit<Client, 'id'>) => {
    const created = await clientService.create(data);
    setClients(prev => [...prev, created]);
    toast.success('Cliente salvo!');
    return created;
  };

  const updateClient = async (id: string, data: Omit<Client, 'id'>) => {
    await clientService.update(id, data);
    setClients(prev => prev.map(c => c.id === id ? { ...data, id } : c));
    toast.success('Cliente atualizado!');
  };

  const deleteClient = async (id: string) => {
    await clientService.delete(id);
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente removido!');
  };

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient, loading }}>
      {children}
    </ClientsContext.Provider>
  );
}

export const useClients = () => useContext(ClientsContext);
