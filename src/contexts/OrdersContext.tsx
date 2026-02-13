import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  loading: boolean;
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
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

  return (
    <OrdersContext.Provider value={{ orders, addOrder, loading }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
