/**
 * Service pour les paiements
 */

import api from '@/config/api';
import { buildApiUrl, getDefaultHeaders } from '@/config/api';

/**
 * Liste tous les paiements
 */
export const getPayments = async (params?: {
  page?: number;
  limit?: number;
  date?: string;
  type?: string;
  status?: string;
  method?: string;
  search?: string;
  patientId?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.method) queryParams.append('method', params.method);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.patientId) queryParams.append('patientId', params.patientId);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/payments?${queryString}` : '/payments';
  
  return api.get(endpoint);
};

/**
 * Récupérer un paiement par ID
 */
export const getPaymentById = async (id: string): Promise<any> => {
  return api.get(`/payments/${id}`);
};

/**
 * Créer un paiement
 */
export const createPayment = async (paymentData: {
  patientId: string;
  amount: number;
  method: 'cash' | 'orange_money';
  type: 'consultation' | 'lab' | 'imaging' | 'pharmacy';
  reference?: string;
  relatedId?: string;
}): Promise<any> => {
  return api.post('/payments', paymentData);
};

/**
 * Modifier le statut d'un paiement
 */
export const updatePaymentStatus = async (id: string, status: 'pending' | 'paid' | 'cancelled'): Promise<any> => {
  return api.patch(`/payments/${id}/status`, { status });
};

/**
 * Annuler un paiement
 */
export const cancelPayment = async (id: string): Promise<any> => {
  return api.delete(`/payments/${id}`, { confirm: true });
};

/**
 * Statistiques des paiements
 */
export const getPaymentsStats = async (params?: {
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/payments/stats?${queryString}` : '/payments/stats';
  
  return api.get(endpoint);
};

/**
 * Exporter les paiements en Excel
 */
export const exportPayments = async (params?: {
  date?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/payments/export?${queryString}` : '/payments/export';
  
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
