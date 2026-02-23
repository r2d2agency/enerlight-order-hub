import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, FileText, UserPlus, LayoutDashboard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/contexts/ProductsContext';
import { ImagePlus } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/consulta', icon: Search, label: 'Preços' },
  { to: '/pedidos', icon: FileText, label: 'Pedido', action: 'new-order' },
  { to: '/clientes', icon: UserPlus, label: 'Clientes' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useProducts();
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceSearch, setPriceSearch] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(priceSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(priceSearch.toLowerCase())
  );

  const handleNav = (item: typeof navItems[0]) => {
    if (item.to === '/consulta') {
      setPriceOpen(true);
      return;
    }
    navigate(item.to);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = item.to !== '/consulta' && (
              location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to))
            );
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Price lookup dialog */}
      <Dialog open={priceOpen} onOpenChange={setPriceOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">Consulta de Preços</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={priceSearch}
              onChange={e => setPriceSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 -mx-2 px-2 space-y-2">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Nenhum produto encontrado.</p>
            ) : (
              filtered.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <ImagePlus className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.code} · {p.unit}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary text-sm">
                      R$ {Number(p.conventionPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">convenção</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
