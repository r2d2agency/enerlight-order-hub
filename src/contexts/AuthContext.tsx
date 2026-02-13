import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('enerlight-user');
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('enerlight-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check on initial mount, not after login
    if (token) {
      authService.me()
        .then(u => {
          setUser(u);
          localStorage.setItem('enerlight-user', JSON.stringify(u));
        })
        .catch(() => {
          // API not available — keep cached user (already loaded in state init)
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('enerlight-token', res.token);
      localStorage.setItem('enerlight-user', JSON.stringify(res.user));
    } catch {
      // Fallback: if API not ready, allow demo login
      if (email === 'admin@enerlight.com.br' && password === 'admin123') {
        const demoUser: User = { id: '1', name: 'Admin Enerlight', email, role: 'admin', active: true };
        const demoToken = 'demo-token';
        setToken(demoToken);
        setUser(demoUser);
        localStorage.setItem('enerlight-token', demoToken);
        localStorage.setItem('enerlight-user', JSON.stringify(demoUser));
        return;
      }
      throw new Error('Email ou senha inválidos');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('enerlight-token');
    localStorage.removeItem('enerlight-user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
