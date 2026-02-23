import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { productService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProductsContextType {
  products: Product[];
  addProduct: (data: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextType>({
  products: [],
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  loading: true,
});

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    productService.list()
      .then(data => setProducts(data))
      .catch((err) => {
        console.error('Erro ao carregar produtos da API:', err);
        toast.error('Erro ao carregar produtos do servidor.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const addProduct = async (data: Omit<Product, 'id'>) => {
    const created = await productService.create(data);
    setProducts(prev => [...prev, created]);
    toast.success('Produto salvo!');
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    await productService.update(id, data);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    toast.success('Produto atualizado!');
  };

  const deleteProduct = async (id: string) => {
    await productService.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produto removido!');
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
