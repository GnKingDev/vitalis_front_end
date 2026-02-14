/**
 * Service pour la gestion du prix de consultation
 */

import api from '@/config/api';

/**
 * Récupérer le prix actuel de la consultation
 */
export const getConsultationPrice = async (): Promise<{
  success: boolean;
  data: { price: number };
  message?: string;
}> => {
  return api.get('/consultation/price');
};

/**
 * Mettre à jour le prix de la consultation
 */
export const updateConsultationPrice = async (data: {
  price: number;
}): Promise<{
  success: boolean;
  message: string;
  data?: { price: number };
}> => {
  return api.put('/consultation/price', data);
};
