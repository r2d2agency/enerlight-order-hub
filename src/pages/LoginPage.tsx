import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Zap, LogIn } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { branding } = useBranding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Erro', description: 'Preencha email e senha.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-contain mb-3" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-3">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
          )}
          <h1 className="font-display text-2xl font-bold text-card-foreground">{branding.companyName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Demo: admin@enerlight.com.br / admin123
        </p>
      </Card>
    </div>
  );
}
