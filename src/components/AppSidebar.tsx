import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Users, Settings, Palette, Zap, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/pedidos', icon: FileText, label: 'Pedidos' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/usuarios', icon: Settings, label: 'Usuários' },
  { to: '/configuracoes', icon: Palette, label: 'Configurações' },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-secondary text-secondary-foreground flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        {branding.logoUrl ? (
          <img src={branding.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-secondary-foreground">{branding.companyName}</h1>
          <p className="text-xs text-sidebar-foreground opacity-60">{branding.subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground">
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="text-sm flex-1 min-w-0">
            <p className="font-medium text-sidebar-accent-foreground truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-sidebar-foreground opacity-60 truncate">{user?.email || ''}</p>
          </div>
          <button onClick={handleLogout} className="text-sidebar-foreground hover:text-destructive transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
