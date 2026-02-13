import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { productService } from '@/services';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.list()
      .then(data => setProducts(data))
      .catch(() => { /* API unavailable, keep empty */ })
      .finally(() => setLoading(false));
  }, []);

  const addProduct = async (data: Omit<Product, 'id'>) => {
    try {
      const created = await productService.create(data);
      setProducts(prev => [...prev, created]);
    } catch {
      // Fallback: operate locally
      setProducts(prev => [...prev, { ...data, id: crypto.randomUUID() } as Product]);
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await productService.update(id, data);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    } catch {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
