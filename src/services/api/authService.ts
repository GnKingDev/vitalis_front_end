/**
 * Service d'authentification
 * Gère toutes les requêtes liées à l'authentification
 */

import api from '@/config/api';
import type { User, UserRole } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  data: LoginResponse;
}

/**
 * Connexion d'un utilisateur
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('🔐 Attempting login with:', { email: credentials.email });
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    console.log('✅ Login response received:', { 
      success: response.success,
      hasToken: !!response.data?.token,
      hasUser: !!response.data?.user,
    });
    
    // Stocker le token et les informations utilisateur
    if (response.data?.token) {
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('💾 Token and user stored in sessionStorage');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

/**
 * Déconnexion
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    // Supprimer le token et les données utilisateur même en cas d'erreur
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Récupérer les informations de l'utilisateur connecté
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ success: boolean; data: User }>('/auth/me');
  return response.data;
};

/**
 * Rafraîchir le token (si implémenté)
 */
export const refreshToken = async (): Promise<string> => {
  const response = await api.post<{ success: boolean; data: { token: string } }>('/auth/refresh');
  
  if (response.data.token) {
    sessionStorage.setItem('token', response.data.token);
  }
  
  return response.data.token;
};

/**
 * Changer le mot de passe
 */
export const changePassword = async (data: {
  currentPassword?: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', data);
  return response;
};
