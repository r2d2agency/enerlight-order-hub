import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '@/types';
import { clientService } from '@/services';

interface ClientsContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, data: Omit<Client, 'id'>) => void;
  deleteClient: (id: string) => void;
  loading: boolean;
}

const ClientsContext = createContext<ClientsContextType>({
  clients: [],
  addClient: () => ({ id: '', name: '', cnpj: '', address: '', neighborhood: '', city: '', state: '', phone: '', email: '' }),
  updateClient: () => {},
  deleteClient: () => {},
  loading: true,
});

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService.list()
      .then(data => setClients(data))
      .catch(() => { /* API unavailable, keep empty */ })
      .finally(() => setLoading(false));
  }, []);

  const addClient = (data: Omit<Client, 'id'>) => {
    const newClient: Client = { ...data, id: crypto.randomUUID() };
    setClients(prev => [...prev, newClient]);
    // Try API in background
    clientService.create(data).catch(() => {});
    return newClient;
  };

  const updateClient = (id: string, data: Omit<Client, 'id'>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...data, id } : c));
    clientService.update(id, data).catch(() => {});
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    clientService.delete(id).catch(() => {});
  };

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient, loading }}>
      {children}
    </ClientsContext.Provider>
  );
}

export const useClients = () => useContext(ClientsContext);
