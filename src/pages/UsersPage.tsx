import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useUsers } from '@/contexts/UsersContext';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; email: string; role: 'admin' | 'vendedor' | 'projetista'; active: boolean } | null>(null);
  const { toast } = useToast();

  const emptyForm: { name: string; email: string; role: 'admin' | 'vendedor' | 'projetista'; active: boolean; password: string } = { name: '', email: '', role: 'vendedor', active: true, password: '' };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (u: { id: string; name: string; email: string; role: 'admin' | 'vendedor' | 'projetista'; active: boolean }) => {
    setEditing(u);
    setForm({ ...u, password: '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) {
      toast({ title: 'Erro', description: 'Nome e email são obrigatórios.', variant: 'destructive' });
      return;
    }
    if (!editing && !form.password) {
      toast({ title: 'Erro', description: 'Senha é obrigatória para novo usuário.', variant: 'destructive' });
      return;
    }
    if (editing) {
      const updateData: Record<string, unknown> = { name: form.name, email: form.email, role: form.role, active: form.active };
      if (form.password) updateData.password = form.password;
      updateUser(editing.id, updateData as any);
      toast({ title: 'Usuário atualizado!' });
    } else {
      addUser({ name: form.name, email: form.email, role: form.role, active: form.active, password: form.password });
      toast({ title: 'Usuário cadastrado!' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteUser(id);
    toast({ title: 'Usuário removido.' });
  };

  return (
    <AdminLayout
      title="Usuários"
      subtitle="Gerenciar vendedores e administradores"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>{editing ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}</Label>
                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? '••••••••' : 'Digite a senha'} autoComplete="new-password" />
              </div>
              <div>
                <Label>Perfil</Label>
                <Select value={form.role} onValueChange={(v: 'admin' | 'vendedor' | 'projetista') => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="projetista">Projetista</SelectItem>
                  </SelectContent>
                </Select>
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
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : u.role === 'projetista' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                      {u.role === 'admin' ? 'Admin' : u.role === 'projetista' ? 'Projetista' : 'Vendedor'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${u.active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
