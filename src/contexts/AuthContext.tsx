import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { getCurrentUser, logout as apiLogout } from '@/services/api/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Récupérer l'utilisateur depuis le sessionStorage au démarrage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token && !user) {
      // Essayer de récupérer l'utilisateur depuis l'API
      getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
          sessionStorage.setItem('user', JSON.stringify(currentUser));
        })
        .catch(() => {
          // Token invalide, nettoyer
          sessionStorage.removeItem('token');
          localStorage.removeItem('token');
          sessionStorage.removeItem('user');
        });
    }
  }, [user]);

  const login = useCallback((role: UserRole) => {
    // L'utilisateur est déjà stocké dans sessionStorage après l'appel API
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        // Fallback : utiliser le rôle pour trouver l'utilisateur
        // (pour compatibilité avec l'ancien système)
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    // Cette fonctionnalité n'est plus nécessaire avec l'API
    // L'utilisateur a un rôle fixe depuis le backend
    console.warn('switchRole n\'est plus supporté avec l\'API');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      sessionStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de l\'utilisateur:', error);
      // En cas d'erreur, déconnecter l'utilisateur
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role-based access helpers
export const hasAccess = (userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

export const canAccessLabResults = (role: UserRole | undefined): boolean => {
  // Reception staff cannot access lab results
  if (!role) return false;
  return role !== 'reception';
};
