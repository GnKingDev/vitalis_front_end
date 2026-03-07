/**
 * Service pour la gestion des numéros de laboratoire
 */

import api from '@/config/api';

export interface LabNumber {
  id: string;
  number: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  isAssigned: boolean;
  createdAt?: string;
}

/**
 * Lister tous les numéros lab
 * @param availableOnly - si true, ne retourne que les numéros non assignés
 */
export const getLabNumbers = async (params?: {
  availableOnly?: boolean;
}): Promise<{ success: boolean; data: LabNumber[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.availableOnly === true) {
    queryParams.append('availableOnly', 'true');
  }
  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/lab-numbers?${queryString}`
    : '/lab-numbers';
  return api.get(endpoint);
};

/**
 * Créer un numéro lab
 */
export const createLabNumber = async (number: string): Promise<{
  success: boolean;
  data: LabNumber;
  message?: string;
}> => {
  return api.post('/lab-numbers', { number });
};

/**
 * Assigner ou désassigner un numéro lab à un utilisateur
 * @param labNumberId - ID du numéro lab
 * @param userId - ID de l'utilisateur (null pour désassigner)
 */
export const assignLabNumber = async (
  labNumberId: string,
  userId: string | null
): Promise<{ success: boolean; data: LabNumber; message?: string }> => {
  return api.patch(`/lab-numbers/${labNumberId}/assign`, { userId });
};

/**
 * Supprimer un numéro lab (uniquement si non assigné)
 */
export const deleteLabNumber = async (
  labNumberId: string
): Promise<{ success: boolean; message?: string }> => {
  return api.delete(`/lab-numbers/${labNumberId}`);
};
