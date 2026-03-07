/**
 * Service pour la gestion des sociétés / établissements d'assurance
 */

import api from '@/config/api';

export interface InsuranceEstablishment {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsuranceEstablishmentCreateInput {
  name: string;
  code?: string;
  isActive?: boolean;
}

export interface InsuranceEstablishmentUpdateInput {
  name?: string;
  code?: string;
  isActive?: boolean;
}

/**
 * Lister les établissements d'assurance
 * @param isActive - si true, ne retourne que les établissements actifs
 */
export const getInsuranceEstablishments = async (params?: {
  isActive?: boolean;
}): Promise<{ success: boolean; data: InsuranceEstablishment[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.isActive !== undefined) {
    queryParams.append('isActive', String(params.isActive));
  }
  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/insurance-establishments?${queryString}`
    : '/insurance-establishments';
  return api.get(endpoint);
};

/**
 * Récupérer un établissement par ID
 */
export const getInsuranceEstablishmentById = async (
  id: string
): Promise<{ success: boolean; data: InsuranceEstablishment }> => {
  return api.get(`/insurance-establishments/${id}`);
};

/**
 * Créer un établissement d'assurance
 */
export const createInsuranceEstablishment = async (
  data: InsuranceEstablishmentCreateInput
): Promise<{ success: boolean; data: InsuranceEstablishment }> => {
  return api.post('/insurance-establishments', {
    name: data.name,
    code: data.code ?? undefined,
    isActive: data.isActive !== false,
  });
};

/**
 * Modifier un établissement d'assurance
 */
export const updateInsuranceEstablishment = async (
  id: string,
  data: InsuranceEstablishmentUpdateInput
): Promise<{ success: boolean; data: InsuranceEstablishment }> => {
  return api.put(`/insurance-establishments/${id}`, data);
};

/**
 * Désactiver un établissement (DELETE = désactivation côté backend)
 */
export const deleteInsuranceEstablishment = async (
  id: string
): Promise<{ success: boolean }> => {
  return api.delete(`/insurance-establishments/${id}`);
};
