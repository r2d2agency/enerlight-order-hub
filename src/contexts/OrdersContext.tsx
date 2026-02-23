import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Order) => void;
  deleteOrder: (id: string) => void;
  loading: boolean;
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
  updateOrder: () => {},
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
    try {
      const result = await orderService.create(order);
      // Use local order data (with client/items) but take id/number from API
      const fullOrder = { ...order, id: result.id, number: result.number };
      setOrders(prev => [fullOrder, ...prev]);
      toast.success('Pedido salvo!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar pedido');
    }
  };

  const updateOrder = async (id: string, order: Order) => {
    try {
      await orderService.update(id, order);
      // Keep local order data (with client/items populated)
      setOrders(prev => prev.map(o => o.id === id ? order : o));
      toast.success('Pedido atualizado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar pedido');
    }
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, loading }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
