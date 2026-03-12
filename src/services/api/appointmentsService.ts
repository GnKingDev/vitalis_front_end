/**
 * Service rendez-vous (RDV)
 */

import api from '@/config/api';

export const getAppointments = async (params?: {
  page?: number;
  limit?: number;
  date?: string;
  doctorId?: string;
  status?: string;
  search?: string;
  patientId?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  const qs = queryParams.toString();
  return api.get(`/appointments${qs ? `?${qs}` : ''}`);
};

export const getAppointmentById = async (id: string): Promise<any> => {
  return api.get(`/appointments/${id}`);
};

export const createAppointment = async (data: {
  patientId: string;
  doctorId: string;
  appointmentAt: string;
  notes?: string;
}): Promise<any> => {
  return api.post('/appointments', data);
};

export const updateAppointmentStatus = async (
  id: string,
  status: 'present' | 'absent' | 'cancelled'
): Promise<any> => {
  return api.patch(`/appointments/${id}/status`, { status });
};

/**
 * Rendez-vous du médecin connecté
 */
export const getDoctorAppointments = async (params?: {
  page?: number;
  limit?: number;
  date?: string;
  status?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.status) queryParams.append('status', params.status);
  const qs = queryParams.toString();
  return api.get(`/doctor/appointments${qs ? `?${qs}` : ''}`);
};

/**
 * Créer un rendez-vous (côté médecin : POST /doctor/appointments)
 */
export const createDoctorAppointment = async (data: {
  patientId: string;
  doctorId: string;
  appointmentAt: string;
  notes?: string;
}): Promise<any> => {
  return api.post('/doctor/appointments', data);
};
