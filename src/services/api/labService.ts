/**
 * Service pour le laboratoire
 */

import api from '@/config/api';

/**
 * Liste toutes les demandes de laboratoire
 */
export const getLabRequests = async (params?: {
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
  const endpoint = queryString ? `/lab/requests?${queryString}` : '/lab/requests';
  
  return api.get(endpoint);
};

/**
 * Récupérer une demande par ID
 */
export const getLabRequestById = async (id: string): Promise<any> => {
  return api.get(`/lab/requests/${id}`);
};

/**
 * Récupérer les détails complets d'une demande
 */
export const getLabRequestDetail = async (id: string): Promise<any> => {
  return api.get(`/lab/requests/${id}/detail`);
};

/**
 * Créer une demande de laboratoire
 */
export const createLabRequest = async (requestData: {
  patientId: string;
  doctorId: string;
  consultationId?: string;
  examIds: string[];
  notes?: string;
}): Promise<any> => {
  return api.post('/lab/requests', requestData);
};

/**
 * Assigner une demande à un technicien
 */
export const assignLabRequest = async (id: string, labTechnicianId: string): Promise<any> => {
  return api.patch(`/lab/requests/${id}/assign`, { labTechnicianId });
};

/**
 * Liste tous les examens de laboratoire
 */
export const getLabExams = async (params?: {
  category?: string;
  isActive?: boolean;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/lab/exams?${queryString}` : '/lab/exams';
  
  return api.get(endpoint);
};

/**
 * Liste tous les résultats de laboratoire
 */
export const getLabResults = async (params?: {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  status?: string;
  search?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/lab/results?${queryString}` : '/lab/results';
  
  return api.get(endpoint);
};

/**
 * Récupérer un résultat par ID
 */
export const getLabResultById = async (id: string): Promise<any> => {
  return api.get(`/lab/results/${id}`);
};

/**
 * Créer ou mettre à jour un résultat
 */
export const saveLabResult = async (resultData: {
  labRequestId: string;
  results: any;
  technicianNotes?: string;
}): Promise<any> => {
  return api.post('/lab/results', resultData);
};

/**
 * Valider un résultat
 */
export const validateLabResult = async (id: string): Promise<any> => {
  return api.patch(`/lab/results/${id}/validate`);
};

/**
 * Envoyer un résultat au médecin
 */
export const sendLabResult = async (id: string): Promise<any> => {
  return api.patch(`/lab/results/${id}/send`);
};

/**
 * Générer le PDF d'un résultat
 */
export const getLabResultPDF = async (id: string): Promise<Blob> => {
  const { buildApiUrl, getDefaultHeaders } = await import('@/config/api');
  
  const url = buildApiUrl(`/lab/results/${id}/pdf`);
  const response = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération du PDF');
  }

  return response.blob();
};
