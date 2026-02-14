/**
 * Service pour les patients
 * Gère toutes les requêtes liées aux patients
 */

import api, { buildApiUrl, getDefaultHeaders } from '@/config/api';
import type { Patient } from '@/types';

export interface PatientListResponse {
  success: boolean;
  data: {
    patients: Patient[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface PatientHistoryResponse {
  success: boolean;
  data: {
    patient: Patient;
    consultations: any[];
    labRequests: any[];
    imagingRequests: any[];
    prescriptions: any[];
    payments: any[];
    dossiers: any[];
  };
}

/**
 * Liste tous les patients
 */
export const getPatients = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
}): Promise<PatientListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.date) queryParams.append('date', params.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/patients?${queryString}` : '/patients';
  
  return api.get<PatientListResponse>(endpoint);
};

/**
 * Récupérer un patient par ID
 */
export const getPatientById = async (id: string): Promise<{ success: boolean; data: Patient }> => {
  return api.get<{ success: boolean; data: Patient }>(`/patients/${id}`);
};

/**
 * Créer un nouveau patient
 */
export const createPatient = async (patientData: Partial<Patient>): Promise<{ success: boolean; data: Patient }> => {
  return api.post<{ success: boolean; data: Patient }>('/patients', patientData);
};

/**
 * Mettre à jour un patient
 */
export const updatePatient = async (id: string, patientData: Partial<Patient>): Promise<{ success: boolean; data: Patient }> => {
  return api.put<{ success: boolean; data: Patient }>(`/patients/${id}`, patientData);
};

/**
 * Récupérer l'historique complet d'un patient
 */
export const getPatientHistory = async (id: string): Promise<PatientHistoryResponse> => {
  return api.get<PatientHistoryResponse>(`/patients/${id}/history`);
};

/**
 * Récupérer les dossiers d'un patient
 */
export const getPatientDossiers = async (id: string): Promise<{ success: boolean; data: any[] }> => {
  return api.get<{ success: boolean; data: any[] }>(`/patients/${id}/dossiers`);
};

/**
 * Récupérer la timeline d'un patient
 */
export const getPatientTimeline = async (id: string, includeLabResults: boolean = true): Promise<{ success: boolean; data: any[] }> => {
  const queryParams = new URLSearchParams();
  queryParams.append('includeLabResults', includeLabResults.toString());
  return api.get<{ success: boolean; data: any[] }>(`/patients/${id}/timeline?${queryParams.toString()}`);
};

/**
 * Récupérer les consultations d'un patient
 */
export const getPatientConsultations = async (id: string): Promise<{ success: boolean; data: any[] }> => {
  return api.get<{ success: boolean; data: any[] }>(`/patients/${id}/consultations`);
};

/**
 * Récupérer les ordonnances d'un patient
 */
export const getPatientPrescriptions = async (id: string): Promise<{ success: boolean; data: any[] }> => {
  return api.get<{ success: boolean; data: any[] }>(`/patients/${id}/prescriptions`);
};

/**
 * Exporter la liste des patients en Excel
 */
export const exportPatients = async (params?: { search?: string; date?: string }): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.date) queryParams.append('date', params.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/patients/export?${queryString}` : '/patients/export';
  
  const url = buildApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'export');
  }

  return response.blob();
};
