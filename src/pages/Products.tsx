import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const { toast } = useToast();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.includes(search)
  );

  const emptyProduct: Omit<Product, 'id'> = {
    code: '', name: '', description: '', costPrice: 0, salePrice: 0,
    conventionPrice: 0, unit: 'PC', active: true,
  };

  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);

  const openNew = () => { setEditing(null); setForm(emptyProduct); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm(p); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.code || !form.name) {
      toast({ title: 'Erro', description: 'Código e nome são obrigatórios.', variant: 'destructive' });
      return;
    }
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...form, id: editing.id } : p));
      toast({ title: 'Produto atualizado!' });
    } else {
      setProducts(prev => [...prev, { ...form, id: crypto.randomUUID() }]);
      toast({ title: 'Produto cadastrado!' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Produto removido.' });
  };

  return (
    <AdminLayout
      title="Produtos"
      subtitle={`${products.length} produtos cadastrados`}
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Código</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <Label>Unidade</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Preço de Custo (R$)</Label>
                <Input type="number" step="0.01" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: +e.target.value })} />
              </div>
              <div>
                <Label>Preço de Venda (R$)</Label>
                <Input type="number" step="0.01" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: +e.target.value })} />
              </div>
              <div>
                <Label>Preço Convenção (R$)</Label>
                <Input type="number" step="0.01" value={form.conventionPrice} onChange={e => setForm({ ...form, conventionPrice: +e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right">Venda</TableHead>
              <TableHead className="text-right">Convenção</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.code}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-right">R$ {p.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right font-semibold">R$ {p.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">R$ {p.conventionPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
