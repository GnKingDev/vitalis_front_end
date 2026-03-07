/**
 * Types de consultation (admin: CRUD, réception: liste pour sélection)
 */

import api from '@/config/api';

export interface ConsultationTypeItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Liste des types de consultation
 * @param activeOnly - si true (ou rôle non admin), ne retourne que les actifs
 */
export const getConsultationTypes = async (params?: {
  activeOnly?: boolean;
}): Promise<{ success: boolean; data: ConsultationTypeItem[] }> => {
  const query = new URLSearchParams();
  if (params?.activeOnly !== undefined) query.append('activeOnly', String(params.activeOnly));
  const url = query.toString() ? `/consultation/types?${query}` : '/consultation/types';
  return api.get(url);
};

export const getConsultationTypeById = async (id: string) => {
  return api.get(`/consultation/types/${id}`);
};

export const createConsultationType = async (data: {
  name: string;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
}) => {
  return api.post('/consultation/types', data);
};

export const updateConsultationType = async (
  id: string,
  data: Partial<{ name: string; price: number; isActive: boolean; sortOrder: number }>
) => {
  return api.put(`/consultation/types/${id}`, data);
};

export const deleteConsultationType = async (id: string) => {
  return api.delete(`/consultation/types/${id}`);
};
