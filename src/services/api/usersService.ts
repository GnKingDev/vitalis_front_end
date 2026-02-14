/**
 * Service pour les utilisateurs (admin)
 */

import api from '@/config/api';

/**
 * Liste tous les utilisateurs
 */
export const getUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.role) queryParams.append('role', params.role);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/users?${queryString}` : '/users';
  
  return api.get(endpoint);
};

/**
 * Récupérer un utilisateur par ID
 */
export const getUserById = async (id: string): Promise<any> => {
  return api.get(`/users/${id}`);
};

/**
 * Créer un utilisateur
 * Le backend génère automatiquement un mot de passe si password n'est pas fourni
 * Le mot de passe généré est retourné dans response.data.password
 */
export const createUser = async (userData: {
  name: string;
  email: string;
  password?: string; // Optionnel, le backend génère un mot de passe si non fourni
  role: 'admin' | 'reception' | 'doctor' | 'lab' | 'pharmacy';
  department?: string;
}): Promise<any> => {
  return api.post('/users', userData);
};

/**
 * Mettre à jour un utilisateur
 */
export const updateUser = async (id: string, userData: Partial<{
  name: string;
  email: string;
  role: string;
  department: string;
}>): Promise<any> => {
  return api.put(`/users/${id}`, userData);
};

/**
 * Suspendre un utilisateur
 */
export const suspendUser = async (id: string): Promise<any> => {
  return api.patch(`/users/${id}/suspend`);
};

/**
 * Réactiver un utilisateur
 */
export const activateUser = async (id: string): Promise<any> => {
  return api.patch(`/users/${id}/activate`);
};

/**
 * Supprimer un utilisateur
 */
export const deleteUser = async (id: string): Promise<any> => {
  return api.delete(`/users/${id}`);
};

/**
 * Statistiques des utilisateurs
 */
export const getUsersStats = async (): Promise<any> => {
  return api.get('/users/stats');
};
