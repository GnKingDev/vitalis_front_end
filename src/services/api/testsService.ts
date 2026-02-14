/**
 * Service pour les tests de laboratoire et d'imagerie
 */

import api from '@/config/api';

/**
 * Liste tous les tests de laboratoire
 */
export const getLabExams = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/lab/exams?${queryString}` : '/lab/exams';
  
  return api.get(endpoint);
};

/**
 * Récupérer un test de laboratoire par ID
 */
export const getLabExamById = async (id: string): Promise<any> => {
  return api.get(`/lab/exams/${id}`);
};

/**
 * Créer un test de laboratoire
 */
export const createLabExam = async (examData: {
  name: string;
  category: string;
  price: number;
}): Promise<any> => {
  return api.post('/lab/exams', examData);
};

/**
 * Mettre à jour un test de laboratoire
 */
export const updateLabExam = async (id: string, examData: Partial<{
  name: string;
  category: string;
  price: number;
}>): Promise<any> => {
  return api.put(`/lab/exams/${id}`, examData);
};

/**
 * Supprimer un test de laboratoire
 */
export const deleteLabExam = async (id: string): Promise<any> => {
  return api.delete(`/lab/exams/${id}`);
};

/**
 * Liste tous les tests d'imagerie
 */
export const getImagingExams = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/imaging/exams?${queryString}` : '/imaging/exams';
  
  return api.get(endpoint);
};

/**
 * Récupérer un test d'imagerie par ID
 */
export const getImagingExamById = async (id: string): Promise<any> => {
  return api.get(`/imaging/exams/${id}`);
};

/**
 * Créer un test d'imagerie
 */
export const createImagingExam = async (examData: {
  name: string;
  category: string;
  price: number;
}): Promise<any> => {
  return api.post('/imaging/exams', examData);
};

/**
 * Mettre à jour un test d'imagerie
 */
export const updateImagingExam = async (id: string, examData: Partial<{
  name: string;
  category: string;
  price: number;
}>): Promise<any> => {
  return api.put(`/imaging/exams/${id}`, examData);
};

/**
 * Supprimer un test d'imagerie
 */
export const deleteImagingExam = async (id: string): Promise<any> => {
  return api.delete(`/imaging/exams/${id}`);
};
