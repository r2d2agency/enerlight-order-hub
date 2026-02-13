import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, ImagePlus } from 'lucide-react';
import { Product } from '@/types';
import { productService } from '@/services';
import { mockProducts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
    conventionPrice: 0, unit: 'PC', active: true, imageUrl: '',
  };

  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.list();
      setProducts(data);
    } catch {
      // Fallback to mock data when API is unavailable
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyProduct); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm(p); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.code || !form.name) {
      toast({ title: 'Erro', description: 'Código e nome são obrigatórios.', variant: 'destructive' });
      return;
    }
    try {
      if (editing) {
        await productService.update(editing.id, form);
        toast({ title: 'Produto atualizado!' });
      } else {
        await productService.create(form);
        toast({ title: 'Produto cadastrado!' });
      }
      setDialogOpen(false);
      fetchProducts();
    } catch {
      toast({ title: 'Erro ao salvar produto', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.delete(id);
      toast({ title: 'Produto removido.' });
      fetchProducts();
    } catch {
      toast({ title: 'Erro ao remover produto', variant: 'destructive' });
    }
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
           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Image upload */}
              <div className="col-span-1 sm:col-span-2 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/50 shrink-0">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Produto" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Label>Foto do Produto</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setForm({ ...form, imageUrl: url });
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Código</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <Label>Unidade</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
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
            <div className="flex justify-end gap-3 mt-4">
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
              <TableHead className="w-14">Foto</TableHead>
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
                <TableCell>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
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
