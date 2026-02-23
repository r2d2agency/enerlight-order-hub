import { Order } from '@/types';
import { Zap } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

interface OrderPrintProps {
  order: Order;
}

export default function OrderPrint({ order }: OrderPrintProps) {
  const { branding } = useBranding();
  const formatCurrency = (v: number | string) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const formatDate = (d: string) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-card text-card-foreground p-8 rounded-xl max-w-3xl mx-auto text-sm" id="order-print">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-3">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
          <div>
            <h1 className="font-display text-xl font-bold text-card-foreground">{branding.companyName}</h1>
            <p className="text-xs text-muted-foreground">{branding.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">{formatDate(order.date)}</p>
          <p className="font-display text-lg font-bold text-primary">PROPOSTA Nº {order.number}</p>
        </div>
      </div>

      {/* Client info */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium">{order.client.name}</span></div>
        <div><span className="text-muted-foreground">CNPJ:</span> <span className="font-mono">{order.client.cnpj}</span></div>
        <div><span className="text-muted-foreground">Endereço:</span> {order.client.address}</div>
        <div><span className="text-muted-foreground">Bairro:</span> {order.client.neighborhood}</div>
        <div><span className="text-muted-foreground">Cidade:</span> {order.client.city}/{order.client.state}</div>
        <div><span className="text-muted-foreground">Telefone:</span> {order.client.phone}</div>
      </div>

      {/* Items table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-primary/20">
            <th className="text-left py-2 text-muted-foreground font-medium">Seq.</th>
            <th className="text-left py-2 text-muted-foreground font-medium w-12">Foto</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Produto</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Descrição</th>
            <th className="text-center py-2 text-muted-foreground font-medium">Un.</th>
            <th className="text-center py-2 text-muted-foreground font-medium">Qtd.</th>
            <th className="text-right py-2 text-muted-foreground font-medium">Preço</th>
            <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={item.id} className="border-b border-border">
              <td className="py-2">{i + 1}</td>
              <td className="py-2">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted" />
                )}
              </td>
              <td className="py-2 font-mono text-xs">{item.product.code}</td>
              <td className="py-2">{item.product.name}</td>
              <td className="py-2 text-center">{item.product.unit}</td>
              <td className="py-2 text-center">{Number(item.quantity).toFixed(2).replace('.', ',')}</td>
              <td className="py-2 text-right">{formatCurrency(item.product.conventionPrice)}</td>
              <td className="py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1">
          {order.observations && <div className="text-xs text-muted-foreground mb-2">Obs: {order.observations}</div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>R$ {formatCurrency(order.freight)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Subst. Trib.</span><span>R$ {formatCurrency(order.taxSubstitution)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Descontos</span><span>R$ {formatCurrency(order.totalDiscount)}</span></div>
          <div className="flex justify-between border-t-2 border-primary pt-2 mt-2">
            <span className="font-bold text-base">Valor Total</span>
            <span className="font-bold text-base text-primary">R$ {formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm grid grid-cols-2 gap-2">
        <div><span className="text-muted-foreground">Validade:</span> {order.validityDays} dias</div>
        <div><span className="text-muted-foreground">Pagamento:</span> {order.paymentCondition}</div>
        <div><span className="text-muted-foreground">Forma:</span> {order.paymentMethod}</div>
        <div><span className="text-muted-foreground">Prazo Entrega:</span> {order.deliveryDeadline || '-'}</div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
        <p className="font-medium">Vendedor: {order.seller}</p>
        <p className="mt-1">ENERLIGHT ENERGIA FOTOVOLTAICA E ILUMINAÇÃO LED - CNPJ: 35.018.948/0001-59</p>
        <p>Rua Joaquim Gomes Camacho, 185 - São José do Rio Preto - SP | (17) 3353-9050 | enerlight.com.br</p>
      </div>

      {/* Signature */}
      <div className="mt-8 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-8">
          É de responsabilidade do cliente a conferência de todas as informações antes da efetivação do pedido.
        </p>
        <div className="flex gap-8">
          <div className="flex-1 border-t border-foreground/30 pt-2 text-center text-xs text-muted-foreground">Nome e RG</div>
          <div className="flex-1 border-t border-foreground/30 pt-2 text-center text-xs text-muted-foreground">Assinatura</div>
          <div className="w-32 border-t border-foreground/30 pt-2 text-center text-xs text-muted-foreground">Data</div>
        </div>
      </div>
    </div>
  );
}
