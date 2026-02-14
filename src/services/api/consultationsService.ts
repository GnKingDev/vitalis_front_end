/**
 * Service pour les consultations
 */

import api from '@/config/api';

export interface ConsultationResponse {
  success: boolean;
  data: any;
}

/**
 * Liste toutes les consultations
 */
export const getConsultations = async (params?: {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  status?: string;
  date?: string;
}): Promise<ConsultationResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.date) queryParams.append('date', params.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/consultations?${queryString}` : '/consultations';
  
  return api.get<ConsultationResponse>(endpoint);
};

/**
 * Récupérer une consultation par ID
 */
export const getConsultationById = async (id: string): Promise<ConsultationResponse> => {
  return api.get<ConsultationResponse>(`/consultations/${id}`);
};

/**
 * Créer une consultation
 */
export const createConsultation = async (consultationData: any): Promise<ConsultationResponse> => {
  return api.post<ConsultationResponse>('/consultations', consultationData);
};

/**
 * Mettre à jour une consultation
 */
export const updateConsultation = async (id: string, consultationData: any): Promise<ConsultationResponse> => {
  return api.put<ConsultationResponse>(`/consultations/${id}`, consultationData);
};

/**
 * Terminer une consultation
 */
export const completeConsultation = async (id: string): Promise<{ success: boolean; message: string }> => {
  return api.post<{ success: boolean; message: string }>(`/consultations/${id}/complete`);
};

/**
 * Ajouter un item personnalisé
 */
export const addCustomItem = async (consultationId: string, itemData: { name: string; description?: string }): Promise<ConsultationResponse> => {
  return api.post<ConsultationResponse>(`/consultations/${consultationId}/custom-items`, itemData);
};

/**
 * Archiver un dossier de consultation
 */
export const archiveDossier = async (dossierId: string): Promise<{ success: boolean; message: string }> => {
  return api.post<{ success: boolean; message: string }>(`/consultations/dossiers/${dossierId}/archive`);
};
