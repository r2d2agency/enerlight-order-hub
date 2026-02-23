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
  imageUrl?: string;
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
  role: 'admin' | 'vendedor' | 'projetista';
  active: boolean;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  items: Array<{ productId: string; quantity: number; notes?: string }>;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  clientName?: string;
  clientCnpj?: string;
  templateId?: string;
  templateName?: string;
  items: Array<{ productId: string; quantity: number; notes?: string }>;
  notes: string;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'cancelado';
  createdBy?: string;
  creatorName?: string;
  createdAt?: string;
}
