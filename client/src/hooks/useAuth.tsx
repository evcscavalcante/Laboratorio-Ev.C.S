import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, getIdToken } from 'firebase/auth';
import { onAuthStateChange, logout as firebaseLogout } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  token: string | null;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  syncUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth sendo usado fora do AuthProvider, retornando valores padrão');
    return {
      user: null,
      userProfile: null,
      isLoading: false,
      loading: false,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
      logout: async () => {},
      sendPasswordReset: async () => {}
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const syncUser = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.user) {
            setUserProfile(data.user);
          }
        }
      } else {
        console.warn('Falha na sincronização do usuário:', response.status);
      }
    } catch (error) {
      console.error('Erro ao sincronizar usuário:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Obter token Firebase
          const idToken = await getIdToken(firebaseUser);
          setToken(idToken);
          
          // Extrair informações do usuário Firebase
          const customClaims = (firebaseUser as any).reloadUserRecord?.customClaims || {};
          
          // Definir role baseado no email do usuário
          let userRole = customClaims.role || 'TECHNICIAN';
          if (firebaseUser.email === 'evcsousa@yahoo.com.br') {
            userRole = 'ADMIN';
          }
          
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            role: userRole
          };
          
          setUserProfile(profile);
          
          // Sincronizar com backend para obter role correto
          await syncUser();
        } catch (error) {
          console.error('Erro ao processar autenticação:', error);
        }
      } else {
        setUserProfile(null);
        setToken(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [user, token]);

  const hasRole = (role: string) => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return userProfile?.role ? roles.includes(userProfile.role) : false;
  };

  const logout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      setUserProfile(null);
      setToken(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      token,
      hasRole,
      hasAnyRole,
      syncUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};