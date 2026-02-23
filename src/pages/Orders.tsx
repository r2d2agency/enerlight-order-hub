import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Eye, Trash2, FileText, X, Download, Pencil, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, OrderItem, Product } from '@/types';
import { useClients } from '@/contexts/ClientsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useUsers } from '@/contexts/UsersContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useToast } from '@/hooks/use-toast';
import OrderPrint from '@/components/OrderPrint';

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const { clients } = useClients();
  const { products } = useProducts();
  const { users } = useUsers();
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Order | null>(null);
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);

  const handleDownloadPdf = useCallback(async (order: Order) => {
    setGeneratingPdf(true);
    try {
      const el = document.getElementById('order-print');
      if (!el) return;
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`proposta-${order.number}.pdf`);
      toast({ title: 'PDF gerado com sucesso!' });
    } catch {
      toast({ title: 'Erro ao gerar PDF', variant: 'destructive' });
    } finally {
      setGeneratingPdf(false);
    }
  }, [toast]);

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
      unitPrice: firstProduct.conventionPrice,
      discount: 0,
      total: firstProduct.conventionPrice,
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
          updated.unitPrice = prod.conventionPrice;
          updated.total = prod.conventionPrice * updated.quantity;
        }
      }
      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        updated.total = (updated.unitPrice - updated.discount) * updated.quantity;
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleSaveOrder = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client || items.length === 0) {
      toast({ title: 'Erro', description: 'Selecione um cliente e adicione pelo menos um item.', variant: 'destructive' });
      return;
    }
    const orderData: Order = {
      id: editingOrder?.id || crypto.randomUUID(),
      number: editingOrder?.number || Math.max(...orders.map(o => o.number), 9000) + 1,
      date: editingOrder?.date || new Date().toISOString().split('T')[0],
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
      status: editingOrder?.status || 'rascunho',
    };
    if (editingOrder) {
      updateOrder(editingOrder.id, orderData);
      toast({ title: `Proposta #${orderData.number} atualizada!` });
    } else {
      addOrder(orderData);
      toast({ title: `Proposta #${orderData.number} criada!` });
    }
    setCreating(false);
    setEditingOrder(null);
    setItems([]);
    setSelectedClientId('');
  };

  const resetForm = () => {
    setEditingOrder(null);
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

  const openEditOrder = (order: Order) => {
    setEditingOrder(order);
    setCreating(true);
    setSelectedClientId(order.client?.id || '');
    setItems(order.items.map(item => ({ ...item })));
    setFreight(Number(order.freight) || 0);
    setTaxSub(Number(order.taxSubstitution) || 0);
    setObs(order.observations || '');
    setPayCondition(order.paymentCondition || 'A VISTA');
    setPayMethod(order.paymentMethod || 'DEPOSITO');
    setValidityDays(order.validityDays || 7);
    setDeliveryDeadline(order.deliveryDeadline || '');
    setSeller(order.seller || '');
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
                    <TableCell>{(() => { const d = new Date(o.date); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR'); })()}</TableCell>
                    <TableCell className="font-medium">{o.client?.name || '-'}</TableCell>
                    <TableCell className="text-right font-semibold">R$ {Number(o.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setViewing(o)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditOrder(o)}><Pencil className="w-4 h-4" /></Button>
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
              <h3 className="font-display font-semibold text-lg">{editingOrder ? `Editar Proposta #${editingOrder.number}` : 'Nova Proposta Comercial'}</h3>
              <Button variant="ghost" size="icon" onClick={() => { setCreating(false); setEditingOrder(null); }}><X className="w-5 h-5" /></Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="sm:col-span-2">
                <Label>Cliente</Label>
                <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={clientPopoverOpen} className="w-full justify-between font-normal">
                      {selectedClientId ? clients.find(c => c.id === selectedClientId)?.name : 'Selecione o cliente'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {clients.map(c => (
                            <CommandItem key={c.id} value={c.name} onSelect={() => { setSelectedClientId(c.id); setClientPopoverOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", selectedClientId === c.id ? "opacity-100" : "opacity-0")} />
                              {c.name} {c.cnpj ? `- ${c.cnpj}` : ''}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                <div className="overflow-x-auto -mx-3 px-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="w-20">Qtd.</TableHead>
                      <TableHead className="w-28">Preço Un.</TableHead>
                      <TableHead className="w-28">Desc. Un.</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.product?.imageUrl ? (
                              <img src={item.product.imageUrl} alt={item.product?.name} className="w-8 h-8 rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-muted shrink-0" />
                            )}
                            <Select value={item.product?.id || item.productId} onValueChange={v => updateItem(item.id, 'productId', v)}>
                              <SelectTrigger className="min-w-[160px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name} ({Number(p.costPrice).toFixed(2).replace('.', ',')})</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
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
                          R$ {Number(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Frete (R$)</Label>
                <Input type="number" step="0.01" value={freight} onChange={e => setFreight(+e.target.value)} />
              </div>
              <div>
                <Label>Subst. Tributária (R$)</Label>
                <Input type="number" step="0.01" value={taxSub} onChange={e => setTaxSub(+e.target.value)} />
              </div>
              <div className="sm:col-span-2">
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
              <Button variant="outline" onClick={() => { setCreating(false); setEditingOrder(null); }}>Cancelar</Button>
              <Button onClick={handleSaveOrder}><FileText className="w-4 h-4 mr-2" /> {editingOrder ? 'Salvar Alterações' : 'Gerar Proposta'}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* View order dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="font-display">Proposta Comercial</DialogTitle>
            {viewing && (
              <Button size="sm" onClick={() => handleDownloadPdf(viewing)} disabled={generatingPdf}>
                <Download className="w-4 h-4 mr-2" /> {generatingPdf ? 'Gerando...' : 'Salvar PDF'}
              </Button>
            )}
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
