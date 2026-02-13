import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '@/types';
import { clientService } from '@/services';

const STORAGE_KEY = 'enerlight-clients';

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
  const [clients, setClients] = useState<Client[]>(loadFromStorage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService.list()
      .then(data => { setClients(data); saveToStorage(data); })
      .catch(() => { /* API unavailable, keep localStorage data */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { saveToStorage(clients); }, [clients]);

  const addClient = (data: Omit<Client, 'id'>) => {
    const newClient: Client = { ...data, id: crypto.randomUUID() };
    setClients(prev => [...prev, newClient]);
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
