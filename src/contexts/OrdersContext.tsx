import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const STORAGE_KEY = 'enerlight-orders';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  loading: boolean;
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
  deleteOrder: () => {},
  loading: true,
});

function loadFromStorage(): Order[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveToStorage(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>(loadFromStorage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    orderService.list()
      .then(data => { setOrders(data); saveToStorage(data); })
      .catch((err) => {
        console.error('Erro ao carregar pedidos da API:', err);
        toast.error('Não foi possível conectar ao servidor. Usando dados locais.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { saveToStorage(orders); }, [orders]);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, deleteOrder, loading }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
