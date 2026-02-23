import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, FolderKanban, LayoutTemplate } from 'lucide-react';
import { Project, ProjectTemplate } from '@/types';
import { projectService, templateService } from '@/services';
import { useClients } from '@/contexts/ClientsContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Projects() {
  const { user } = useAuth();
  const { clients } = useClients();
  const canManageTemplates = user?.role === 'admin' || user?.role === 'projetista';

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Project dialog
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({ name: '', clientId: '', templateId: '', notes: '', status: 'rascunho' as Project['status'] });

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '' });

  useEffect(() => {
    Promise.all([projectService.list(), templateService.list()])
      .then(([p, t]) => { setProjects(p); setTemplates(t); })
      .catch(() => toast.error('Erro ao carregar projetos'))
      .finally(() => setLoading(false));
  }, []);

  // ---- Projects CRUD ----
  const openNewProject = () => {
    setEditingProject(null);
    setProjectForm({ name: '', clientId: '', templateId: '', notes: '', status: 'rascunho' });
    setProjectDialogOpen(true);
  };

  const openEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectForm({ name: p.name, clientId: p.clientId || '', templateId: p.templateId || '', notes: p.notes, status: p.status });
    setProjectDialogOpen(true);
  };

  const saveProject = async () => {
    if (!projectForm.name) { toast.error('Nome é obrigatório'); return; }
    try {
      if (editingProject) {
        await projectService.update(editingProject.id, projectForm);
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...projectForm, clientName: clients.find(c => c.id === projectForm.clientId)?.name, templateName: templates.find(t => t.id === projectForm.templateId)?.name } : p));
        toast.success('Projeto atualizado!');
      } else {
        const created = await projectService.create(projectForm);
        setProjects(prev => [{ ...projectForm, ...created, clientName: clients.find(c => c.id === projectForm.clientId)?.name, templateName: templates.find(t => t.id === projectForm.templateId)?.name, items: [], creatorName: user?.name } as Project, ...prev]);
        toast.success('Projeto criado!');
      }
      setProjectDialogOpen(false);
    } catch { toast.error('Erro ao salvar projeto'); }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Projeto removido!');
    } catch { toast.error('Erro ao remover projeto'); }
  };

  // ---- Templates CRUD ----
  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', description: '' });
    setTemplateDialogOpen(true);
  };

  const openEditTemplate = (t: ProjectTemplate) => {
    setEditingTemplate(t);
    setTemplateForm({ name: t.name, description: t.description });
    setTemplateDialogOpen(true);
  };

  const saveTemplate = async () => {
    if (!templateForm.name) { toast.error('Nome é obrigatório'); return; }
    try {
      if (editingTemplate) {
        await templateService.update(editingTemplate.id, templateForm);
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateForm } : t));
        toast.success('Template atualizado!');
      } else {
        const created = await templateService.create({ ...templateForm, items: [] });
        setTemplates(prev => [...prev, created]);
        toast.success('Template criado!');
      }
      setTemplateDialogOpen(false);
    } catch { toast.error('Erro ao salvar template'); }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await templateService.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template removido!');
    } catch { toast.error('Erro ao remover template'); }
  };

  const statusColors: Record<string, string> = {
    rascunho: 'bg-muted text-muted-foreground',
    em_andamento: 'bg-primary/10 text-primary',
    concluido: 'bg-success/10 text-success',
    cancelado: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, string> = {
    rascunho: 'Rascunho',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  if (loading) {
    return (
      <AdminLayout title="Projetos" subtitle="Carregando...">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Projetos"
      subtitle={`${projects.length} projetos`}
      actions={
        <Button onClick={openNewProject}><Plus className="w-4 h-4 mr-2" /> Novo Projeto</Button>
      }
    >
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2"><FolderKanban className="w-4 h-4" /> Projetos</TabsTrigger>
          {canManageTemplates && (
            <TabsTrigger value="templates" className="gap-2"><LayoutTemplate className="w-4 h-4" /> Templates</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="projects">
          <Card className="p-6">
            {projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum projeto cadastrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado por</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.clientName || '-'}</TableCell>
                      <TableCell>{p.templateName || '-'}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status]}`}>
                          {statusLabels[p.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.creatorName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditProject(p)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {canManageTemplates && (
          <TabsContent value="templates">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-semibold text-lg">Templates de Projeto</h3>
                <Button variant="outline" onClick={openNewTemplate}><Plus className="w-4 h-4 mr-2" /> Novo Template</Button>
              </div>
              {templates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum template cadastrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-muted-foreground">{t.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditTemplate(t)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteTemplate(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome do Projeto</Label>
              <Input value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Cliente</Label>
              <Select value={projectForm.clientId} onValueChange={v => setProjectForm({ ...projectForm, clientId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canManageTemplates && (
              <div>
                <Label>Template</Label>
                <Select value={projectForm.templateId} onValueChange={v => setProjectForm({ ...projectForm, templateId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um template" /></SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Status</Label>
              <Select value={projectForm.status} onValueChange={(v: Project['status']) => setProjectForm({ ...projectForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={projectForm.notes} onChange={e => setProjectForm({ ...projectForm, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveProject}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editingTemplate ? 'Editar Template' : 'Novo Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome do Template</Label>
              <Input value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={templateForm.description} onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveTemplate}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
