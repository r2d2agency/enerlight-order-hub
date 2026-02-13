import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, ImagePlus, Upload, Download } from 'lucide-react';
import { Product } from '@/types';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/hooks/use-toast';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const header = 'codigo;nome;descricao;preco_custo;preco_venda;preco_convencao;unidade';
    const example = 'PROD001;Luminária LED 20W;Luminária de alta eficiência;45.90;89.90;79.90;PC';
    const csv = `${header}\n${example}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_produtos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      
      if (lines.length < 2) {
        toast({ title: 'Erro', description: 'O arquivo está vazio ou só contém o cabeçalho.', variant: 'destructive' });
        return;
      }

      let imported = 0;
      let errors = 0;

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(';').map(c => c.trim());
        if (cols.length < 5) { errors++; continue; }

        const [code, name, description, costPriceStr, salePriceStr, conventionPriceStr, unit] = cols;
        const costPrice = parseFloat(costPriceStr?.replace(',', '.') || '0');
        const salePrice = parseFloat(salePriceStr?.replace(',', '.') || '0');
        const conventionPrice = parseFloat(conventionPriceStr?.replace(',', '.') || '0');

        if (!code || !name || isNaN(costPrice) || isNaN(salePrice)) {
          errors++;
          continue;
        }

        addProduct({
          code,
          name,
          description: description || '',
          costPrice,
          salePrice,
          conventionPrice: isNaN(conventionPrice) ? 0 : conventionPrice,
          unit: unit || 'PC',
          active: true,
          imageUrl: '',
        });
        imported++;
      }

      toast({
        title: `Importação concluída!`,
        description: `${imported} produto(s) importado(s)${errors > 0 ? `, ${errors} linha(s) com erro` : ''}.`,
      });
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.includes(search)
  );

  const emptyProduct: Omit<Product, 'id'> = {
    code: '', name: '', description: '', costPrice: 0, salePrice: 0,
    conventionPrice: 0, unit: 'PC', active: true, imageUrl: '',
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
      updateProduct(editing.id, form);
      toast({ title: 'Produto atualizado!' });
    } else {
      addProduct(form);
      toast({ title: 'Produto cadastrado!' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast({ title: 'Produto removido.' });
  };

  return (
    <AdminLayout
      title="Produtos"
      subtitle={`${products.length} produtos cadastrados`}
      actions={
        <div className="flex gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" /> Modelo CSV
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Importar CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Produto</Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
        </div>
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

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado. Clique em "Novo Produto" para começar.</p>
        ) : (
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
        )}
      </Card>
    </AdminLayout>
  );
}
