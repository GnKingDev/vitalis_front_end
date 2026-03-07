/**
 * Service pour le médecin
 */

import api from '@/config/api';

/**
 * Liste des dossiers de consultation
 */
export const getDoctorDossiers = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  date?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.date) queryParams.append('date', params.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/doctor/dossiers?${queryString}` : '/doctor/dossiers';
  
  return api.get(endpoint);
};

/**
 * Récupérer un dossier complet
 */
export const getDoctorDossierById = async (id: string): Promise<any> => {
  return api.get(`/doctor/dossiers/${id}`);
};

/**
 * Créer ou mettre à jour une consultation
 */
export const saveDoctorConsultation = async (consultationData: {
  patientId: string;
  symptoms?: string;
  vitals?: any;
  diagnosis?: string;
  notes?: string;
  dossierId?: string;
}): Promise<any> => {
  return api.post('/doctor/consultations', consultationData);
};

/**
 * Terminer une consultation
 */
export const completeDoctorConsultation = async (id: string): Promise<any> => {
  return api.post(`/doctor/consultations/${id}/complete`);
};

/**
 * Liste des ordonnances
 */
export const getDoctorPrescriptions = async (params?: {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/doctor/prescriptions?${queryString}` : '/doctor/prescriptions';
  
  return api.get(endpoint);
};

/**
 * Créer une ordonnance
 */
export const createDoctorPrescription = async (prescriptionData: {
  consultationId?: string;
  patientId: string;
  items: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string;
    instructions?: string;
  }>;
  notes?: string;
}): Promise<any> => {
  return api.post('/doctor/prescriptions', prescriptionData);
};

/**
 * Envoyer une ordonnance à la pharmacie
 */
export const sendPrescription = async (id: string): Promise<any> => {
  return api.patch(`/doctor/prescriptions/${id}/send`);
};

/**
 * Supprimer un item d'ordonnance
 */
export const deletePrescriptionItem = async (itemId: string): Promise<any> => {
  return api.delete(`/doctor/prescription-items/${itemId}`);
};

/**
 * Générer le PDF d'une ordonnance
 */
export const getPrescriptionPDF = async (prescriptionId: string): Promise<Blob> => {
  const { buildApiUrl, getDefaultHeaders } = await import('@/config/api');

  const url = buildApiUrl(`/doctor/prescriptions/${prescriptionId}/pdf`);
  const response = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Erreur lors de la génération du PDF');
  }

  return response.blob();
};

/**
 * Liste des items personnalisés
 */
export const getDoctorCustomItems = async (params?: {
  patientId?: string;
  consultationId?: string;
  doctorId?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.consultationId) queryParams.append('consultationId', params.consultationId);
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/doctor/custom-items?${queryString}` : '/doctor/custom-items';
  
  return api.get(endpoint);
};

/**
 * Supprimer un item personnalisé
 */
export const deleteDoctorCustomItem = async (itemId: string): Promise<any> => {
  return api.delete(`/doctor/custom-items/${itemId}`);
};

/**
 * Créer un item personnalisé
 */
export const createDoctorCustomItem = async (itemData: {
  consultationId?: string;
  patientId: string;
  doctorId: string;
  name: string;
  description?: string;
}): Promise<any> => {
  return api.post('/doctor/custom-items', itemData);
};

/**
 * Liste combinée des résultats (lab et imagerie)
 */
export const getDoctorResults = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  patientId?: string;
  search?: string;
  date?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.date) queryParams.append('date', params.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/doctor/results?${queryString}` : '/doctor/results';
  
  return api.get(endpoint);
};

/**
 * Récupérer un résultat (lab ou imagerie)
 */
export const getDoctorResultById = async (id: string): Promise<any> => {
  return api.get(`/doctor/results/${id}`);
};

/**
 * Générer le PDF d'un item personnalisé (résultat externe labo/imagerie)
 */
export const getCustomItemPDF = async (itemId: string): Promise<Blob> => {
  const { buildApiUrl, getDefaultHeaders } = await import('@/config/api');

  const url = buildApiUrl(`/doctor/custom-items/${itemId}/pdf`);
  const response = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Erreur lors de la génération du PDF');
  }

  return response.blob();
};

/**
 * Modifier sa propre disponibilité (médecin uniquement)
 */
export const updateMyAvailability = async (available: boolean): Promise<any> => {
  return api.patch('/doctor/me/availability', { available });
};
