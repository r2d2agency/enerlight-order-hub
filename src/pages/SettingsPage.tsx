import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBranding } from '@/contexts/BrandingContext';
import { useToast } from '@/hooks/use-toast';
import { Palette, Type, ImagePlus, RotateCcw, Lock } from 'lucide-react';
import { authService } from '@/services';

const presetColors = [
  { label: 'Âmbar', value: '38 92% 50%' },
  { label: 'Azul', value: '217 91% 60%' },
  { label: 'Verde', value: '142 70% 45%' },
  { label: 'Vermelho', value: '0 84% 60%' },
  { label: 'Roxo', value: '262 83% 58%' },
  { label: 'Rosa', value: '330 81% 60%' },
  { label: 'Laranja', value: '25 95% 53%' },
  { label: 'Ciano', value: '186 94% 41%' },
];

const sidebarPresets = [
  { label: 'Escuro Azul', value: '220 25% 14%' },
  { label: 'Preto', value: '0 0% 8%' },
  { label: 'Cinza Escuro', value: '220 10% 20%' },
  { label: 'Azul Marinho', value: '222 47% 11%' },
  { label: 'Verde Escuro', value: '160 25% 12%' },
];

function hslToHex(hsl: string): string {
  const parts = hsl.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return '#f59e0b';
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '38 92% 50%';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function SettingsPage() {
  const { branding, updateBranding } = useBranding();
  const { toast } = useToast();
  const [name, setName] = useState(branding.companyName);
  const [subtitle, setSubtitle] = useState(branding.subtitle);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Erro', description: 'A nova senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não conferem.', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast({ title: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar senha';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = () => {
    updateBranding({ companyName: name, subtitle });
    toast({ title: 'Branding atualizado!' });
  };

  const handleReset = () => {
    updateBranding({
      companyName: 'ENERLIGHT',
      subtitle: 'Sistema de Pedidos',
      logoUrl: '',
      primaryColor: '38 92% 50%',
      sidebarColor: '220 25% 14%',
    });
    setName('ENERLIGHT');
    setSubtitle('Sistema de Pedidos');
    toast({ title: 'Branding restaurado ao padrão.' });
  };

  return (
    <AdminLayout
      title="Configurações"
      subtitle="Personalize o branding do sistema"
      actions={
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" /> Restaurar Padrão
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Company Info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Identidade</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Nome da Empresa</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Nome</Button>
          </div>
        </Card>

        {/* Logo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImagePlus className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Logo</h3>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    updateBranding({ logoUrl: url });
                    toast({ title: 'Logo atualizada!' });
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">PNG ou SVG transparente recomendado</p>
              {branding.logoUrl && (
                <Button variant="outline" size="sm" onClick={() => updateBranding({ logoUrl: '' })}>
                  Remover Logo
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Primary Color */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Cor Principal</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="color"
              value={hslToHex(branding.primaryColor)}
              onChange={e => updateBranding({ primaryColor: hexToHsl(e.target.value) })}
              className="w-12 h-12 rounded-lg cursor-pointer border-0"
            />
            <p className="text-sm text-muted-foreground">Escolha uma cor personalizada ou use um preset:</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map(c => (
              <button
                key={c.value}
                onClick={() => updateBranding({ primaryColor: c.value })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${branding.primaryColor === c.value ? 'border-foreground shadow-md' : 'border-border hover:border-foreground/30'}`}
              >
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `hsl(${c.value})` }} />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Sidebar Color */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Cor da Sidebar</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="color"
              value={hslToHex(branding.sidebarColor)}
              onChange={e => updateBranding({ sidebarColor: hexToHsl(e.target.value) })}
              className="w-12 h-12 rounded-lg cursor-pointer border-0"
            />
            <p className="text-sm text-muted-foreground">Cor de fundo do menu lateral:</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sidebarPresets.map(c => (
              <button
                key={c.value}
                onClick={() => updateBranding({ sidebarColor: c.value })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${branding.sidebarColor === c.value ? 'border-foreground shadow-md' : 'border-border hover:border-foreground/30'}`}
              >
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `hsl(${c.value})` }} />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </button>
            ))}
          </div>
        </Card>
        {/* Change Password */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Alterar Senha</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Senha Atual</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <Label>Nova Senha</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <Label>Confirmar Nova Senha</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" />
            </div>
            <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full">
              {changingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
