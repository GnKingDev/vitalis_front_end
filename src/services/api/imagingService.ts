/**
 * Service pour l'imagerie
 */

import api from '@/config/api';

/**
 * Liste toutes les demandes d'imagerie
 */
export const getImagingRequests = async (params?: {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  status?: string;
  date?: string;
  search?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/imaging/requests?${queryString}` : '/imaging/requests';
  
  return api.get(endpoint);
};

/**
 * Récupérer une demande par ID
 */
export const getImagingRequestById = async (id: string): Promise<any> => {
  return api.get(`/imaging/requests/${id}`);
};

/**
 * Créer une demande d'imagerie
 */
export const createImagingRequest = async (requestData: {
  patientId: string;
  doctorId: string;
  consultationId?: string;
  examIds: string[];
  notes?: string;
}): Promise<any> => {
  return api.post('/imaging/requests', requestData);
};

/**
 * Assigner une demande à un technicien
 */
export const assignImagingRequest = async (id: string, labTechnicianId: string): Promise<any> => {
  return api.patch(`/imaging/requests/${id}/assign`, { labTechnicianId });
};

/**
 * Marquer une demande comme terminée
 */
export const completeImagingRequest = async (id: string, results: string): Promise<any> => {
  return api.patch(`/imaging/requests/${id}/complete`, { results });
};

/**
 * Liste tous les examens d'imagerie
 */
export const getImagingExams = async (params?: {
  category?: string;
  isActive?: boolean;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/imaging/exams?${queryString}` : '/imaging/exams';
  
  return api.get(endpoint);
};

/**
 * Générer le PDF d'un résultat d'imagerie
 */
export const getImagingRequestPDF = async (id: string): Promise<Blob> => {
  const { buildApiUrl, getDefaultHeaders } = await import('@/config/api');
  
  const url = buildApiUrl(`/imaging/requests/${id}/pdf`);
  const response = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération du PDF');
  }

  return response.blob();
};
