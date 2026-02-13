import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BrandingConfig {
  companyName: string;
  subtitle: string;
  logoUrl: string;
  primaryColor: string; // HSL string like "38 92% 50%"
  sidebarColor: string; // HSL string
}

const defaultBranding: BrandingConfig = {
  companyName: 'ENERLIGHT',
  subtitle: 'Sistema de Pedidos',
  logoUrl: '',
  primaryColor: '217 91% 50%',
  sidebarColor: '220 25% 14%',
};

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  updateBranding: () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem('enerlight-branding');
    return saved ? { ...defaultBranding, ...JSON.parse(saved) } : defaultBranding;
  });

  useEffect(() => {
    localStorage.setItem('enerlight-branding', JSON.stringify(branding));

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', branding.primaryColor);
    root.style.setProperty('--sidebar-primary', branding.primaryColor);
    root.style.setProperty('--ring', branding.primaryColor);
    root.style.setProperty('--sidebar-background', branding.sidebarColor);

    // Derive accent from primary
    const hue = branding.primaryColor.split(' ')[0];
    root.style.setProperty('--accent', `${hue} 70% 95%`);
    root.style.setProperty('--accent-foreground', `${hue} 92% 35%`);
  }, [branding]);

  const updateBranding = (config: Partial<BrandingConfig>) => {
    setBranding(prev => ({ ...prev, ...config }));
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
