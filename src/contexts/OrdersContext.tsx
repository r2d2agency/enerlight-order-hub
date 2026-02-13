import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.list()
      .then(data => setOrders(data))
      .catch(() => { /* API unavailable, keep empty */ })
      .finally(() => setLoading(false));
  }, []);

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
