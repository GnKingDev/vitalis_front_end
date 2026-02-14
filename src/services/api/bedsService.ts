/**
 * Service pour la gestion des lits
 */

import api from '@/config/api';

/**
 * Liste tous les lits
 */
export const getBeds = async (params?: {
  page?: number;
  limit?: number;
  type?: 'classic' | 'vip' | 'all';
  status?: 'occupied' | 'available' | 'all';
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/beds?${queryString}` : '/beds';
  
  return api.get(endpoint);
};

/**
 * Récupérer un lit par ID
 */
export const getBedById = async (id: string): Promise<any> => {
  return api.get(`/beds/${id}`);
};

/**
 * Créer un lit
 */
export const createBed = async (bedData: {
  number: string;
  type: 'classic' | 'vip';
  additionalFee?: number;
}): Promise<any> => {
  return api.post('/beds', bedData);
};

/**
 * Mettre à jour un lit
 */
export const updateBed = async (id: string, bedData: Partial<{
  number: string;
  type: 'classic' | 'vip';
  additionalFee: number;
}>): Promise<any> => {
  return api.put(`/beds/${id}`, bedData);
};

/**
 * Supprimer un lit
 */
export const deleteBed = async (id: string): Promise<any> => {
  return api.delete(`/beds/${id}`);
};

/**
 * Libérer un lit (marquer comme disponible)
 */
export const freeBed = async (id: string): Promise<any> => {
  return api.patch(`/beds/${id}/free`);
};

/**
 * Occuper un lit
 */
export const occupyBed = async (id: string, patientId: string): Promise<any> => {
  return api.patch(`/beds/${id}/occupy`, { patientId });
};
