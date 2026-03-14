/**
 * Service pour la pharmacie
 */

import api, { buildApiUrl, getDefaultHeaders } from '@/config/api';

/**
 * Liste tous les produits
 */
export const getPharmacyProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  unit?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.unit) queryParams.append('unit', params.unit);
  if (params?.lowStock) queryParams.append('lowStock', 'true');
  if (params?.outOfStock) queryParams.append('outOfStock', 'true');

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/pharmacy/products?${queryString}` : '/pharmacy/products';
  
  return api.get(endpoint);
};

/**
 * Récupérer un produit par ID
 */
export const getPharmacyProductById = async (id: string): Promise<any> => {
  return api.get(`/pharmacy/products/${id}`);
};

/**
 * Créer un produit
 */
export const createPharmacyProduct = async (productData: {
  name: string;
  category: string;
  price: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  expiryDate?: string;
}): Promise<any> => {
  return api.post('/pharmacy/products', productData);
};

/**
 * Mettre à jour un produit
 */
export const updatePharmacyProduct = async (id: string, productData: Partial<any>): Promise<any> => {
  return api.put(`/pharmacy/products/${id}`, productData);
};

/**
 * Supprimer un produit
 */
export const deletePharmacyProduct = async (id: string): Promise<any> => {
  return api.delete(`/pharmacy/products/${id}`);
};

/**
 * Liste toutes les unités
 */
export const getPharmacyUnits = async (): Promise<any> => {
  return api.get('/pharmacy/units');
};

/**
 * Créer une unité
 */
export const createPharmacyUnit = async (name: string): Promise<any> => {
  return api.post('/pharmacy/units', { name });
};

/**
 * Modifier une unité
 */
export const updatePharmacyUnit = async (id: string, name: string): Promise<any> => {
  return api.put(`/pharmacy/units/${id}`, { name });
};

/**
 * Supprimer une unité
 */
export const deletePharmacyUnit = async (id: string): Promise<any> => {
  return api.delete(`/pharmacy/units/${id}`);
};

/**
 * Liste toutes les alertes de stock
 */
export const getPharmacyAlerts = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/pharmacy/alerts?${queryString}` : '/pharmacy/alerts';
  
  return api.get(endpoint);
};

/**
 * Statistiques des alertes
 */
export const getPharmacyAlertsStats = async (): Promise<any> => {
  return api.get('/pharmacy/alerts/stats');
};

/**
 * Liste tous les paiements de pharmacie
 */
export const getPharmacyPayments = async (params?: {
  page?: number;
  limit?: number;
  date?: string;
  status?: string;
  search?: string;
  isInsured?: boolean;
  hasDiscount?: boolean;
  insuranceEstablishmentId?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.isInsured !== undefined) queryParams.append('isInsured', params.isInsured.toString());
  if (params?.hasDiscount !== undefined) queryParams.append('hasDiscount', params.hasDiscount.toString());
  if (params?.insuranceEstablishmentId) queryParams.append('insuranceEstablishmentId', params.insuranceEstablishmentId);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/pharmacy/payments?${queryString}` : '/pharmacy/payments';
  
  return api.get(endpoint);
};

/**
 * Exporter les paiements pharmacie en Excel
 */
export const exportPharmacyPayments = async (params?: {
  date?: string;
  status?: string;
  search?: string;
  isInsured?: boolean;
  hasDiscount?: boolean;
  insuranceEstablishmentId?: string;
}): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.isInsured !== undefined) queryParams.append('isInsured', params.isInsured.toString());
  if (params?.hasDiscount !== undefined) queryParams.append('hasDiscount', params.hasDiscount.toString());
  if (params?.insuranceEstablishmentId) queryParams.append('insuranceEstablishmentId', params.insuranceEstablishmentId);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/pharmacy/payments/export?${queryString}` : '/pharmacy/payments/export';

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
 * Récupérer les détails d'un paiement pharmacie
 */
export const getPharmacyPaymentById = async (id: string): Promise<any> => {
  return api.get(`/pharmacy/payments/${id}`);
};

/**
 * Créer un paiement de pharmacie
 */
export const createPharmacyPayment = async (paymentData: {
  patientId?: string;
  items: Array<{ productId: string; quantity: number }>;
  method: 'cash' | 'orange_money';
  reference?: string;
  insurance?: {
    isInsured: boolean;
    establishmentId?: string;
    coveragePercent?: number;
    memberNumber?: string;
  };
  discount?: {
    hasDiscount: boolean;
    discountPercent?: number;
  };
}): Promise<any> => {
  return api.post('/pharmacy/payments', paymentData);
};

/**
 * Statistiques de la pharmacie
 */
export const getPharmacyStats = async (params?: { date?: string }): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/pharmacy/stats?${queryString}` : '/pharmacy/stats';
  
  return api.get(endpoint);
};

/**
 * Liste toutes les catégories de produits
 */
export const getPharmacyCategories = async (): Promise<any> => {
  return api.get('/pharmacy/categories');
};

/**
 * Créer une nouvelle catégorie
 */
export const createPharmacyCategory = async (categoryData: {
  name: string;
  description?: string;
}): Promise<any> => {
  return api.post('/pharmacy/categories', categoryData);
};

/**
 * Mettre à jour une catégorie
 */
export const updatePharmacyCategory = async (id: string, categoryData: {
  name?: string;
  description?: string;
}): Promise<any> => {
  return api.put(`/pharmacy/categories/${id}`, categoryData);
};

/**
 * Supprimer une catégorie
 */
export const deletePharmacyCategory = async (id: string): Promise<any> => {
  return api.delete(`/pharmacy/categories/${id}`);
};
