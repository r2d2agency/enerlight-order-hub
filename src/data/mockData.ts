import { Product, Client, Order, User } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1', code: '518', name: 'LED PLAFON RECUADO EMBUTIR',
    description: 'LUMINÁRIA LED PLAFON RECUADO EMBUTIR, POTENCIA 18W, FLUXO LUMINOSO 2.050 LM, COR 3.000K/4.000K, ÂNGULO 120°, IP 30, VIDA ÚTIL 25.000H, DIMENSÕES 200x200x80mm.',
    costPrice: 17.45, salePrice: 150, conventionPrice: 64.9, unit: 'PC', active: true,
  },
  {
    id: '2', code: '897', name: 'LUMINÁRIA LINEAR E40 SOBREPOR 1M 3000K',
    description: 'LUMINÁRIA LINEAR E40, POTENCIA 27W, 220V, FLUXO LUMINOSO 3.700 LM, COR 3.000K, ACABAMENTO BRANCO, ÂNGULO 120°, IP 40, VIDA ÚTIL 30.000H, DIMENSÕES 1.000x60x80mm.',
    costPrice: 113.61, salePrice: 390, conventionPrice: 358.8, unit: 'PC', active: true,
  },
  {
    id: '3', code: '896', name: 'LUMINÁRIA LINEAR E40 SOBREPOR 1,5M 3000K',
    description: 'LUMINÁRIA LINEAR E40, POTENCIA 27W, 220V, FLUXO LUMINOSO 3.700 LM, COR 3.000K, ACABAMENTO BRANCO, ÂNGULO 120°, IP 40, VIDA ÚTIL 30.000H, DIMENSÕES 1.500x60x80mm.',
    costPrice: 168.68, salePrice: 450, conventionPrice: 414, unit: 'PC', active: true,
  },
  {
    id: '4', code: '506', name: 'LUMINÁRIA PENDENTE BR MANIA',
    description: 'LUMINÁRIA PENDENTE BR MANIA, POTENCIA 9W, FLUXO LUMINOSO 800 LM, COR 3.000K, ACABAMENTO BRANCO, ÂNGULO 60°, IP 20, ALUMINIO PRETO, VIDA ÚTIL 30.000H, DIMENSÕES Ø370x170mm.',
    costPrice: 87.78, salePrice: 240, conventionPrice: 139.9, unit: 'PC', active: true,
  },
  {
    id: '5', code: '14', name: 'PETRO E 100 90°',
    description: 'Driver 100W, Fluxo Luminoso 13.380 lm, eficiência 194 lm/W, tensão 220V, cor 5000K, IP66, vida útil 100.000h, garantia 5 anos.',
    costPrice: 197.79, salePrice: 570, conventionPrice: 524.4, unit: 'PC', active: true,
  },
  {
    id: '6', code: '16', name: 'PETRO E 150 90°',
    description: 'Driver 150W, Fluxo Luminoso 26.760 lm, eficiência 194 lm/W, tensão 220V, cor 5000K, vida útil 100.000h, garantia 5 anos.',
    costPrice: 349.17, salePrice: 850, conventionPrice: 782, unit: 'PC', active: true,
  },
  {
    id: '7', code: '1508', name: 'LUMINÁRIA PÚBLICA 100W',
    description: 'Driver 100W, Fluxo Luminoso 12.200 lm, 220V, alumínio injetado, lente fotometria, vidro temperado, cor 5000K, IP66, vida útil 70.000h, garantia 5 anos. SEM SOQUETE.',
    costPrice: 195.78, salePrice: 620, conventionPrice: 570.4, unit: 'PC', active: true,
  },
  {
    id: '8', code: '2154', name: 'LUMINÁRIA PÚBLICA 150W',
    description: 'Driver 150W, Fluxo Luminoso 21.000 lm, 220V, alumínio injetado, lente fotometria, vidro temperado, cor 5000K, IP66, vida útil 70.000h, garantia 5 anos. SEM SOQUETE.',
    costPrice: 0, salePrice: 790, conventionPrice: 726.8, unit: 'PC', active: true,
  },
];

export const mockClients: Client[] = [
  {
    id: '1', name: 'CAVALCANTE RABELO LTDA', cnpj: '08.041.444/0001-87',
    address: 'AVENIDA ROSA E SILVA, 2000', neighborhood: 'TAMARINEIRA',
    city: 'Recife', state: 'PE', phone: '(81) 9114-1616', email: 'contato@cavalcanterabelo.com.br',
  },
];

export const mockUsers: User[] = [
  { id: '1', name: 'Bruna Carolina da Silva', email: 'bruna@enerlight.com.br', role: 'vendedor', active: true },
  { id: '2', name: 'Admin Enerlight', email: 'admin@enerlight.com.br', role: 'admin', active: true },
];

export const mockOrders: Order[] = [
  {
    id: '1', number: 9154, date: '2026-01-30',
    client: mockClients[0],
    items: [
      { id: '1', productId: '35', product: { id: '35', code: '000035', name: 'TRILHO ELETRIFICADO 1M BRAN', description: '', costPrice: 0, salePrice: 45, conventionPrice: 45, unit: 'PC', active: true }, quantity: 3, unitPrice: 45, discount: 0, total: 135 },
      { id: '2', productId: '2744', product: { id: '2744', code: '002744', name: 'SPOT LED ORIEN BR MANIA BRAN P/TRILHO 3000K 7W BIV', description: '', costPrice: 0, salePrice: 49, conventionPrice: 49, unit: 'PC', active: true }, quantity: 9, unitPrice: 49, discount: 0, total: 441 },
    ],
    subtotal: 576, freight: 200, taxSubstitution: 0, totalDiscount: 0, total: 776,
    validityDays: 7, paymentCondition: 'A VISTA', paymentMethod: 'DEPOSITO', deliveryDeadline: '',
    observations: '', seller: 'BRUNA CAROLINA DA SILVA', status: 'enviado',
  },
];
