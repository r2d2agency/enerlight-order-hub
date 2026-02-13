import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Package, FileText, Users, TrendingUp } from 'lucide-react';
import { mockProducts, mockOrders, mockClients } from '@/data/mockData';

const stats = [
  { label: 'Produtos Ativos', value: mockProducts.filter(p => p.active).length, icon: Package, color: 'text-primary' },
  { label: 'Pedidos', value: mockOrders.length, icon: FileText, color: 'text-accent-foreground' },
  { label: 'Clientes', value: mockClients.length, icon: Users, color: 'text-success' },
  { label: 'Faturamento', value: `R$ ${mockOrders.reduce((s, o) => s + o.total, 0).toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'text-primary' },
];

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral do sistema">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-display font-bold mt-1 text-card-foreground">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg text-card-foreground mb-4">Últimos Pedidos</h3>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-card-foreground">Proposta #{order.number}</p>
                  <p className="text-sm text-muted-foreground">{order.client.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-card-foreground">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg text-card-foreground mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {mockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-card-foreground text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Cód: {product.code}</p>
                </div>
                <p className="font-semibold text-card-foreground">R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
