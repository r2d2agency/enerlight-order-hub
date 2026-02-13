import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Eye, Trash2, FileText, X } from 'lucide-react';
import { Order, OrderItem, Product } from '@/types';
import { useClients } from '@/contexts/ClientsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useUsers } from '@/contexts/UsersContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useToast } from '@/hooks/use-toast';
import OrderPrint from '@/components/OrderPrint';

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, addOrder, deleteOrder } = useOrders();
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const { clients } = useClients();
  const { products } = useProducts();
  const { users } = useUsers();
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Order | null>(null);
  const { toast } = useToast();

  const sellers = users.filter(u => u.role === 'vendedor' && u.active);

  // New order form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [freight, setFreight] = useState(0);
  const [taxSub, setTaxSub] = useState(0);
  const [obs, setObs] = useState('');
  const [payCondition, setPayCondition] = useState('A VISTA');
  const [payMethod, setPayMethod] = useState('DEPOSITO');
  const [validityDays, setValidityDays] = useState(7);
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [seller, setSeller] = useState('');

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.total, 0), [items]);
  const totalDiscount = useMemo(() => items.reduce((s, i) => s + i.discount * i.quantity, 0), [items]);
  const grandTotal = subtotal + freight + taxSub - totalDiscount;

  const addItem = () => {
    if (products.length === 0) {
      toast({ title: 'Erro', description: 'Cadastre produtos antes de criar um pedido.', variant: 'destructive' });
      return;
    }
    const firstProduct = products[0];
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      productId: firstProduct.id,
      product: firstProduct,
      quantity: 1,
      unitPrice: firstProduct.salePrice,
      discount: 0,
      total: firstProduct.salePrice,
    }]);
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'productId') {
        const prod = products.find((p: Product) => p.id === value);
        if (prod) {
          updated.product = prod;
          updated.unitPrice = prod.salePrice;
          updated.total = prod.salePrice * updated.quantity;
        }
      }
      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        updated.total = (updated.unitPrice - updated.discount) * updated.quantity;
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleCreateOrder = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client || items.length === 0) {
      toast({ title: 'Erro', description: 'Selecione um cliente e adicione pelo menos um item.', variant: 'destructive' });
      return;
    }
    const newOrder: Order = {
      id: crypto.randomUUID(),
      number: Math.max(...orders.map(o => o.number), 9000) + 1,
      date: new Date().toISOString().split('T')[0],
      client,
      items,
      subtotal,
      freight,
      taxSubstitution: taxSub,
      totalDiscount,
      total: grandTotal,
      validityDays,
      paymentCondition: payCondition,
      paymentMethod: payMethod,
      deliveryDeadline,
      observations: obs,
      seller,
      status: 'rascunho',
    };
    addOrder(newOrder);
    setCreating(false);
    setItems([]);
    setSelectedClientId('');
    toast({ title: `Proposta #${newOrder.number} criada!` });
  };

  const resetForm = () => {
    setCreating(true);
    setItems([]);
    setSelectedClientId('');
    setFreight(0);
    setTaxSub(0);
    setObs('');
    setPayCondition('A VISTA');
    setPayMethod('DEPOSITO');
    setValidityDays(7);
    setDeliveryDeadline('');
    setSeller('');
  };

  // Auto-open order form when coming from clients page
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    if (clientId && clients.find(c => c.id === clientId)) {
      resetForm();
      setSelectedClientId(clientId);
      const activeSeller = sellers[0];
      if (activeSeller) setSeller(activeSeller.name);
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColors: Record<string, string> = {
    rascunho: 'bg-muted text-muted-foreground',
    enviado: 'bg-primary/10 text-primary',
    aprovado: 'bg-success/10 text-success',
    cancelado: 'bg-destructive/10 text-destructive',
  };

  return (
    <AdminLayout
      title="Pedidos / Propostas"
      subtitle={`${orders.length} propostas comerciais`}
      actions={
        <Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" /> Nova Proposta</Button>
      }
    >
      {/* Order list */}
      {!creating && (
        <Card className="p-6">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma proposta cadastrada. Clique em "Nova Proposta" para começar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono font-bold">#{o.number}</TableCell>
                    <TableCell>{new Date(o.date + 'T12:00:00').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{o.client.name}</TableCell>
                    <TableCell className="text-right font-semibold">R$ {o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setViewing(o)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingOrder(o)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Create order form */}
      {creating && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Nova Proposta Comercial</h3>
              <Button variant="ghost" size="icon" onClick={() => setCreating(false)}><X className="w-5 h-5" /></Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="col-span-2">
                <Label>Cliente</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vendedor</Label>
                <Select value={seller} onValueChange={setSeller}>
                  <SelectTrigger><SelectValue placeholder="Selecione o vendedor" /></SelectTrigger>
                  <SelectContent>
                    {sellers.map(u => (
                      <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Validade (dias)</Label>
                <Input type="number" value={validityDays} onChange={e => setValidityDays(+e.target.value)} />
              </div>
              <div>
                <Label>Condição Pagamento</Label>
                <Input value={payCondition} onChange={e => setPayCondition(e.target.value)} />
              </div>
              <div>
                <Label>Forma Pagamento</Label>
                <Input value={payMethod} onChange={e => setPayMethod(e.target.value)} />
              </div>
              <div>
                <Label>Prazo Entrega</Label>
                <Input value={deliveryDeadline} onChange={e => setDeliveryDeadline(e.target.value)} />
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Itens</Label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Adicionar Item</Button>
              </div>
              {items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="w-24">Qtd.</TableHead>
                      <TableHead className="w-32">Preço Un.</TableHead>
                      <TableHead className="w-32">Desc. Un.</TableHead>
                      <TableHead className="w-32 text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select value={item.product.id} onValueChange={v => updateItem(item.id, 'productId', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name} ({p.costPrice.toFixed(2).replace('.', ',')})</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', +e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', +e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" value={item.discount} onChange={e => updateItem(item.id, 'discount', +e.target.value)} />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Frete (R$)</Label>
                <Input type="number" step="0.01" value={freight} onChange={e => setFreight(+e.target.value)} />
              </div>
              <div>
                <Label>Subst. Tributária (R$)</Label>
                <Input type="number" step="0.01" value={taxSub} onChange={e => setTaxSub(+e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <Textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} />
              </div>
            </div>

            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Subtotal:</span> R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p><span className="text-muted-foreground">Frete:</span> R$ {freight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-display font-bold text-primary">R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button onClick={handleCreateOrder}><FileText className="w-4 h-4 mr-2" /> Gerar Proposta</Button>
            </div>
          </Card>
        </div>
      )}

      {/* View order dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Proposta Comercial</DialogTitle>
          </DialogHeader>
          {viewing && <OrderPrint order={viewing} />}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Proposta #{deletingOrder?.number}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingOrder) { deleteOrder(deletingOrder.id); toast({ title: `Proposta #${deletingOrder.number} excluída.` }); setDeletingOrder(null); } }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
