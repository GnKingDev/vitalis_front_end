/**
 * Service pour les statistiques
 */

import api from '@/config/api';

/**
 * Vue d'ensemble des statistiques
 */
export const getStatsOverview = async (date?: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/overview?${queryString}` : '/stats/overview';
  
  return api.get(endpoint);
};

/**
 * Statistiques des patients
 */
export const getStatsPatients = async (params?: {
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/patients?${queryString}` : '/stats/patients';
  
  return api.get(endpoint);
};

/**
 * Statistiques des consultations
 */
export const getStatsConsultations = async (params?: {
  date?: string;
  doctorId?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/consultations?${queryString}` : '/stats/consultations';
  
  return api.get(endpoint);
};

/**
 * Statistiques des revenus
 */
export const getStatsRevenue = async (params?: {
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/revenue?${queryString}` : '/stats/revenue';
  
  return api.get(endpoint);
};

/**
 * Statistiques du laboratoire
 */
export const getStatsLab = async (date?: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/lab?${queryString}` : '/stats/lab';
  
  return api.get(endpoint);
};

/**
 * Statistiques de l'imagerie
 */
export const getStatsImaging = async (date?: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/imaging?${queryString}` : '/stats/imaging';
  
  return api.get(endpoint);
};

/**
 * Statistiques de la pharmacie
 */
export const getStatsPharmacy = async (date?: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/pharmacy?${queryString}` : '/stats/pharmacy';
  
  return api.get(endpoint);
};

/**
 * Statistiques des utilisateurs
 */
export const getStatsUsers = async (): Promise<any> => {
  return api.get('/stats/users');
};

/**
 * Statistiques des lits
 */
export const getStatsBeds = async (): Promise<any> => {
  return api.get('/stats/beds');
};

/**
 * Rapport quotidien
 */
export const getDailyReport = async (date: string): Promise<any> => {
  return api.get(`/stats/reports/daily?date=${date}`);
};

/**
 * Rapport mensuel
 */
export const getMonthlyReport = async (month?: number, year?: number): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append('month', month.toString());
  if (year) queryParams.append('year', year.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/stats/reports/monthly?${queryString}` : '/stats/reports/monthly';
  
  return api.get(endpoint);
};

/**
 * Statistiques du dashboard selon le rôle
 */
export const getDashboardStats = async (): Promise<any> => {
  return api.get('/dashboard/stats');
};
