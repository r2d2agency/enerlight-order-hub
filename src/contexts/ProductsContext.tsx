import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { productService } from '@/services';

const STORAGE_KEY = 'enerlight-products';

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

function loadFromStorage(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveToStorage(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadFromStorage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.list()
      .then(data => { setProducts(data); saveToStorage(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { saveToStorage(products); }, [products]);

  const addProduct = async (data: Omit<Product, 'id'>) => {
    try {
      const created = await productService.create(data);
      setProducts(prev => [...prev, created]);
    } catch {
      setProducts(prev => [...prev, { ...data, id: crypto.randomUUID() } as Product]);
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await productService.update(id, data);
    } catch {}
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = async (id: string) => {
    try { await productService.delete(id); } catch {}
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
