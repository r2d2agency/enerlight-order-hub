import { createContext, useContext, useState, ReactNode } from 'react';
import { Client } from '@/types';
import { mockClients } from '@/data/mockData';

interface ClientsContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, data: Omit<Client, 'id'>) => void;
  deleteClient: (id: string) => void;
}

const ClientsContext = createContext<ClientsContextType>({
  clients: [],
  addClient: () => ({ id: '', name: '', cnpj: '', address: '', neighborhood: '', city: '', state: '', phone: '', email: '' }),
  updateClient: () => {},
  deleteClient: () => {},
});

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients);

  const addClient = (data: Omit<Client, 'id'>) => {
    const newClient: Client = { ...data, id: crypto.randomUUID() };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, data: Omit<Client, 'id'>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...data, id } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient }}>
      {children}
    </ClientsContext.Provider>
  );
}

export const useClients = () => useContext(ClientsContext);
