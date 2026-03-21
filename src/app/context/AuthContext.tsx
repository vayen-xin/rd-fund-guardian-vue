import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  companyId: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const data = await authApi.current();
      setUser(data);
      localStorage.setItem('token', token!);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      const { token: newToken } = res;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      await fetchCurrentUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || '登录失败' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // 忽略登出错误
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
