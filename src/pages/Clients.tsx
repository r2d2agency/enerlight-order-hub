import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, FileText, Phone, Mail, MapPin, Search } from 'lucide-react';
import { Client } from '@/types';
import { useClients } from '@/contexts/ClientsContext';
import { maskCNPJ, maskPhone } from '@/lib/masks';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const { toast } = useToast();

  const emptyClient: Omit<Client, 'id'> = {
    name: '', cnpj: '', address: '', neighborhood: '', city: '', state: '', phone: '', email: '',
  };
  const [form, setForm] = useState<Omit<Client, 'id'>>(emptyClient);

  const openNew = () => { setEditing(null); setForm(emptyClient); setDialogOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm(c); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) {
      toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' });
      return;
    }
    if (editing) {
      updateClient(editing.id, form);
      toast({ title: 'Cliente atualizado!' });
    } else {
      addClient(form);
      toast({ title: 'Cliente cadastrado!' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast({ title: 'Cliente removido.' });
  };

  return (
    <AdminLayout
      title="Clientes"
      subtitle={`${clients.length} clientes cadastrados`}
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="col-span-1 sm:col-span-2">
                <Label>Razão Social / Nome</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input
                  value={form.cnpj}
                  onChange={e => setForm({ ...form, cnpj: maskCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: maskPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="exemplo@email.com" />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} maxLength={2} placeholder="SP" />
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
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile Cards */}
      {isMobile ? (
        <div className="space-y-3">
          {clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm)).map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm text-foreground truncate">{c.name}</h3>
                {c.cnpj && <span className="text-xs font-mono text-muted-foreground shrink-0">{c.cnpj}</span>}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                {c.city && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{c.city}{c.state ? `/${c.state}` : ''}</div>}
                {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</div>}
                {c.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{c.email}</div>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => navigate(`/pedidos?clientId=${c.id}`)}>
                  <FileText className="w-3.5 h-3.5 mr-1" /> Novo Pedido
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
          {clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhum cliente encontrado.</p>
          )}
        </div>
      ) : (
        /* Desktop Table */
        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm)).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-sm">{c.cnpj}</TableCell>
                  <TableCell>{c.city}/{c.state}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="Novo Pedido" onClick={() => navigate(`/pedidos?clientId=${c.id}`)}><FileText className="w-4 h-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </AdminLayout>
  );
}
