import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '@/types';
import { clientService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const STORAGE_KEY = 'enerlight-clients';

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

function loadFromStorage(): Client[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveToStorage(clients: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function ClientsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>(loadFromStorage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    clientService.list()
      .then(data => { setClients(data); saveToStorage(data); })
      .catch((err) => {
        console.error('Erro ao carregar clientes da API:', err);
        toast.error('Não foi possível conectar ao servidor. Usando dados locais.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { saveToStorage(clients); }, [clients]);

  const addClient = async (data: Omit<Client, 'id'>) => {
    try {
      const created = await clientService.create(data);
      setClients(prev => [...prev, created]);
      toast.success('Cliente salvo no servidor!');
      return created;
    } catch (err) {
      console.error('Erro ao salvar cliente na API:', err);
      toast.error('Erro ao salvar no servidor. Cliente salvo apenas localmente.');
      const newClient: Client = { ...data, id: crypto.randomUUID() };
      setClients(prev => [...prev, newClient]);
      return newClient;
    }
  };

  const updateClient = (id: string, data: Omit<Client, 'id'>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...data, id } : c));
    clientService.update(id, data)
      .then(() => toast.success('Cliente atualizado no servidor!'))
      .catch((err) => {
        console.error('Erro ao atualizar cliente na API:', err);
        toast.error('Erro ao atualizar no servidor.');
      });
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    clientService.delete(id)
      .catch((err) => {
        console.error('Erro ao remover cliente na API:', err);
        toast.error('Erro ao remover no servidor.');
      });
  };

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient, loading }}>
      {children}
    </ClientsContext.Provider>
  );
}

export const useClients = () => useContext(ClientsContext);
