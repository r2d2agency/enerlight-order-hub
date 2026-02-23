import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    orderService.list()
      .then(data => setOrders(data))
      .catch((err) => {
        console.error('Erro ao carregar pedidos da API:', err);
        toast.error('Erro ao carregar pedidos do servidor.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const addOrder = async (order: Order) => {
    const created = await orderService.create(order);
    setOrders(prev => [created, ...prev]);
    toast.success('Pedido salvo!');
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
