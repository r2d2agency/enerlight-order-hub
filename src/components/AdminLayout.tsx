import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import MobileBottomNav from './MobileBottomNav';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="ml-10 lg:ml-0 min-w-0">
              <h1 className="font-display text-lg sm:text-2xl font-bold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
          </div>
        </header>
        <div className="p-3 sm:p-8 animate-fade-in">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
