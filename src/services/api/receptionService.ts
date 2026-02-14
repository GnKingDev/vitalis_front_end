/**
 * Service pour la réception
 */

import api from '@/config/api';
import { buildApiUrl, getDefaultHeaders } from '@/config/api';

/**
 * Liste des patients (réception)
 */
export const getReceptionPatients = async (params?: {
  page?: number;
  limit?: number;
  date?: string;
  search?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/patients?${queryString}` : '/reception/patients';
  
  return api.get(endpoint);
};

/**
 * Enregistrer un nouveau patient avec paiement
 */
export const registerPatient = async (data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  payment: {
    method: 'cash' | 'orange_money';
    amount: number;
    reference?: string;
  };
  bedId?: string;
  assignDoctor?: boolean;
  doctorId?: string;
}): Promise<any> => {
  return api.post('/reception/patients/register', data);
};

/**
 * Enregistrer un paiement pour un patient existant
 */
export const registerPatientPayment = async (patientId: string, paymentData: {
  method: 'cash' | 'orange_money';
  amount: number;
  type: 'consultation' | 'lab' | 'imaging' | 'pharmacy';
  reference?: string;
  relatedId?: string;
}): Promise<any> => {
  return api.post(`/reception/patients/${patientId}/payment`, paymentData);
};

/**
 * Liste des paiements (réception)
 */
export const getReceptionPayments = async (params?: {
  page?: number;
  limit?: number;
  date?: string;
  type?: string;
  status?: string;
  search?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/payments?${queryString}` : '/reception/payments';
  
  return api.get(endpoint);
};

/**
 * Liste des paiements labo/imagerie
 */
export const getReceptionLabPayments = async (params?: {
  page?: number;
  limit?: number;
  date?: string;
  status?: string;
  search?: string;
  type?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.type) queryParams.append('type', params.type);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/lab-payments?${queryString}` : '/reception/lab-payments';
  
  return api.get(endpoint);
};

/**
 * Payer une demande de laboratoire ou imagerie
 */
export const payLabRequest = async (id: string, paymentData: {
  method: 'cash' | 'orange_money';
  reference?: string;
  assignToLab?: boolean;
  labTechnicianId?: string;
  type?: 'lab' | 'imaging';
}): Promise<any> => {
  return api.post(`/reception/lab-payments/${id}/pay`, paymentData);
};

/**
 * Liste des assignations
 */
export const getReceptionAssignments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/assignments?${queryString}` : '/reception/assignments';
  
  return api.get(endpoint);
};

/**
 * Créer une assignation médecin
 */
export const createAssignment = async (assignmentData: {
  patientId: string;
  doctorId: string;
  paymentId: string;
}): Promise<any> => {
  return api.post('/reception/assignments', assignmentData);
};

/**
 * Liste des médecins disponibles
 */
export const getReceptionDoctors = async (): Promise<any> => {
  return api.get('/reception/doctors');
};

/**
 * Liste des lits disponibles
 */
export const getReceptionBeds = async (params?: {
  type?: string;
  available?: boolean;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.available !== undefined) queryParams.append('available', params.available.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/beds?${queryString}` : '/reception/beds';
  
  return api.get(endpoint);
};

/**
 * Liste uniquement les lits disponibles
 */
export const getAvailableBeds = async (type?: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (type) queryParams.append('type', type);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/beds/available?${queryString}` : '/reception/beds/available';
  
  return api.get(endpoint);
};

/**
 * Occuper un lit
 */
export const occupyBed = async (bedId: string, patientId: string): Promise<any> => {
  return api.patch(`/reception/beds/${bedId}/occupy`, { patientId });
};

/**
 * Libérer un lit
 */
export const freeBed = async (bedId: string): Promise<any> => {
  return api.patch(`/reception/beds/${bedId}/free`);
};

/**
 * Statistiques réception
 */
export const getReceptionStats = async (date?: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/stats?${queryString}` : '/reception/stats';
  
  return api.get(endpoint);
};

/**
 * Exporter les patients en Excel
 */
export const exportReceptionPatients = async (params?: { search?: string; date?: string }): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.date) queryParams.append('date', params.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/patients/export?${queryString}` : '/reception/patients/export';
  
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

/**
 * Exporter les paiements labo/imagerie en Excel
 */
export const exportReceptionLabPayments = async (params?: { search?: string; date?: string; status?: string }): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/reception/lab-payments/export?${queryString}` : '/reception/lab-payments/export';
  
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
