/**
 * Configuration de l'API
 * 
 * Cette configuration gère l'URL de base de l'API backend
 * En développement, utilise le proxy Vite (/api)
 * En production, utilise l'URL complète du backend
 */

const getApiBaseUrl = (): string => {
  // En développement, utilise le proxy Vite qui redirige vers le backend
  if (import.meta.env.DEV) {
    // Le proxy Vite intercepte /api et redirige vers http://localhost:3000
    // Donc on utilise /api/v1 qui sera proxifié vers http://localhost:3000/api/v1
    const baseUrl = '/api/v1';
    console.log('🔧 API Base URL (DEV):', baseUrl);
    console.log('🔧 Proxy target:', import.meta.env.VITE_API_URL || 'http://localhost:3000');
    return baseUrl;
  }
  
  // En production, utilise l'URL du backend depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const baseUrl = `${apiUrl}/api/v1`;
  console.log('🔧 API Base URL (PROD):', baseUrl);
  return baseUrl;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Construit une URL complète pour une route API
 */
export const buildApiUrl = (endpoint: string): string => {
  // Enlever le slash initial s'il existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Headers par défaut pour les requêtes API
 */
export const getDefaultHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Ajouter le token d'authentification si disponible
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Gère les erreurs de réponse API
 */
export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'Une erreur est survenue';
  
  try {
    const data = await response.json();
    errorMessage = data.error || data.message || errorMessage;
  } catch {
    // Si la réponse n'est pas du JSON, utiliser le message par défaut
    errorMessage = `Erreur ${response.status}: ${response.statusText}`;
  }

  throw new Error(errorMessage);
};

/**
 * Effectue une requête API avec gestion automatique des erreurs
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  const headers = {
    ...getDefaultHeaders(),
    ...options.headers,
  };

  // Log pour déboguer (uniquement en développement)
  if (import.meta.env.DEV) {
    console.log('🔵 API Request:', {
      method: options.method || 'GET',
      url,
      endpoint,
      baseUrl: API_BASE_URL,
      headers: Object.keys(headers),
    });
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (import.meta.env.DEV) {
      console.log('🟢 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }

    if (!response.ok) {
      await handleApiError(response);
    }

    // Si la réponse est vide (204 No Content), retourner null
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('🔴 API Error:', {
        error: error.message,
        url,
        endpoint,
      });
    }
    throw error;
  }
};

/**
 * Méthodes HTTP helpers
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
