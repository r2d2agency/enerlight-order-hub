export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  costPrice: number;
  salePrice: number;
  conventionPrice: number;
  unit: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  number: number;
  date: string;
  client: Client;
  items: OrderItem[];
  subtotal: number;
  freight: number;
  taxSubstitution: number;
  totalDiscount: number;
  total: number;
  validityDays: number;
  paymentCondition: string;
  paymentMethod: string;
  deliveryDeadline: string;
  observations: string;
  seller: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'cancelado';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendedor';
  active: boolean;
}
