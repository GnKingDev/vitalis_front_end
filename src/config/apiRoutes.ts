/**
 * Configuration centralisée de toutes les routes API
 * 
 * Ce fichier centralise toutes les routes API pour faciliter la maintenance
 * et éviter les erreurs de typo dans les URLs
 */

const API_BASE = '/api/v1';

export const API_ROUTES = {
  // Authentification
  auth: {
    login: `${API_BASE}/auth/login`,
    logout: `${API_BASE}/auth/logout`,
    me: `${API_BASE}/auth/me`,
    refresh: `${API_BASE}/auth/refresh`,
  },

  // Utilisateurs
  users: {
    list: `${API_BASE}/users`,
    get: (id: string) => `${API_BASE}/users/${id}`,
    create: `${API_BASE}/users`,
    update: (id: string) => `${API_BASE}/users/${id}`,
    suspend: (id: string) => `${API_BASE}/users/${id}/suspend`,
    activate: (id: string) => `${API_BASE}/users/${id}/activate`,
    delete: (id: string) => `${API_BASE}/users/${id}`,
    stats: `${API_BASE}/users/stats`,
  },

  // Patients
  patients: {
    list: `${API_BASE}/patients`,
    get: (id: string) => `${API_BASE}/patients/${id}`,
    create: `${API_BASE}/patients`,
    update: (id: string) => `${API_BASE}/patients/${id}`,
    history: (id: string) => `${API_BASE}/patients/${id}/history`,
    timeline: (id: string) => `${API_BASE}/patients/${id}/timeline`,
    dossiers: (id: string) => `${API_BASE}/patients/${id}/dossiers`,
    consultations: (id: string) => `${API_BASE}/patients/${id}/consultations`,
    prescriptions: (id: string) => `${API_BASE}/patients/${id}/prescriptions`,
    export: `${API_BASE}/patients/export`,
    stats: `${API_BASE}/patients/stats`,
    search: `${API_BASE}/patients/search`,
  },

  // Consultations
  consultations: {
    list: `${API_BASE}/consultations`,
    get: (id: string) => `${API_BASE}/consultations/${id}`,
    create: `${API_BASE}/consultations`,
    update: (id: string) => `${API_BASE}/consultations/${id}`,
    complete: (id: string) => `${API_BASE}/consultations/${id}/complete`,
    customItems: (id: string) => `${API_BASE}/consultations/${id}/custom-items`,
  },

  // Dossiers de consultation
  dossiers: {
    list: `${API_BASE}/dossiers`,
    get: (id: string) => `${API_BASE}/dossiers/${id}`,
    archive: (id: string) => `${API_BASE}/dossiers/${id}/archive`,
  },

  // Assignations
  assignments: {
    list: `${API_BASE}/assignments`,
    create: `${API_BASE}/assignments`,
    get: (id: string) => `${API_BASE}/assignments/${id}`,
  },

  // Laboratoire
  lab: {
    exams: {
      list: `${API_BASE}/lab/exams`,
      get: (id: string) => `${API_BASE}/lab/exams/${id}`,
      create: `${API_BASE}/lab/exams`,
      update: (id: string) => `${API_BASE}/lab/exams/${id}`,
      delete: (id: string) => `${API_BASE}/lab/exams/${id}`,
    },
    requests: {
      list: `${API_BASE}/lab/requests`,
      get: (id: string) => `${API_BASE}/lab/requests/${id}`,
      create: `${API_BASE}/lab/requests`,
      assign: (id: string) => `${API_BASE}/lab/requests/${id}/assign`,
      detail: (id: string) => `${API_BASE}/lab/requests/${id}/detail`,
    },
    results: {
      list: `${API_BASE}/lab/results`,
      get: (id: string) => `${API_BASE}/lab/results/${id}`,
      create: `${API_BASE}/lab/results`,
      validate: (id: string) => `${API_BASE}/lab/results/${id}/validate`,
      send: (id: string) => `${API_BASE}/lab/results/${id}/send`,
      pdf: (id: string) => `${API_BASE}/lab/results/${id}/pdf`,
    },
    stats: `${API_BASE}/lab/stats`,
  },

  // Imagerie
  imaging: {
    exams: {
      list: `${API_BASE}/imaging/exams`,
      get: (id: string) => `${API_BASE}/imaging/exams/${id}`,
      create: `${API_BASE}/imaging/exams`,
      update: (id: string) => `${API_BASE}/imaging/exams/${id}`,
      delete: (id: string) => `${API_BASE}/imaging/exams/${id}`,
    },
    requests: {
      list: `${API_BASE}/imaging/requests`,
      get: (id: string) => `${API_BASE}/imaging/requests/${id}`,
      create: `${API_BASE}/imaging/requests`,
      assign: (id: string) => `${API_BASE}/imaging/requests/${id}/assign`,
      complete: (id: string) => `${API_BASE}/imaging/requests/${id}/complete`,
      pdf: (id: string) => `${API_BASE}/imaging/requests/${id}/pdf`,
    },
    stats: `${API_BASE}/imaging/stats`,
  },

  // Pharmacie
  pharmacy: {
    products: {
      list: `${API_BASE}/pharmacy/products`,
      get: (id: string) => `${API_BASE}/pharmacy/products/${id}`,
      create: `${API_BASE}/pharmacy/products`,
      update: (id: string) => `${API_BASE}/pharmacy/products/${id}`,
      delete: (id: string) => `${API_BASE}/pharmacy/products/${id}`,
    },
    alerts: {
      list: `${API_BASE}/pharmacy/alerts`,
      stats: `${API_BASE}/pharmacy/alerts/stats`,
    },
    payments: {
      list: `${API_BASE}/pharmacy/payments`,
      get: (id: string) => `${API_BASE}/pharmacy/payments/${id}`,
      create: `${API_BASE}/pharmacy/payments`,
    },
    prescriptions: {
      list: `${API_BASE}/pharmacy/prescriptions`,
      get: (id: string) => `${API_BASE}/pharmacy/prescriptions/${id}`,
    },
    stats: `${API_BASE}/pharmacy/stats`,
  },

  // Paiements
  payments: {
    list: `${API_BASE}/payments`,
    get: (id: string) => `${API_BASE}/payments/${id}`,
    create: `${API_BASE}/payments`,
    updateStatus: (id: string) => `${API_BASE}/payments/${id}/status`,
    delete: (id: string) => `${API_BASE}/payments/${id}`,
    stats: `${API_BASE}/payments/stats`,
    export: `${API_BASE}/payments/export`,
  },

  // Réception
  reception: {
    patients: {
      list: `${API_BASE}/reception/patients`,
      get: (id: string) => `${API_BASE}/reception/patients/${id}`,
      register: `${API_BASE}/reception/patients/register`,
      payment: (id: string) => `${API_BASE}/reception/patients/${id}/payment`,
      export: `${API_BASE}/reception/patients/export`,
    },
    payments: {
      list: `${API_BASE}/reception/payments`,
      get: (id: string) => `${API_BASE}/reception/payments/${id}`,
    },
    labPayments: {
      list: `${API_BASE}/reception/lab-payments`,
      pay: (id: string) => `${API_BASE}/reception/lab-payments/${id}/pay`,
      export: `${API_BASE}/reception/lab-payments/export`,
    },
    assignments: {
      list: `${API_BASE}/reception/assignments`,
      create: `${API_BASE}/reception/assignments`,
    },
    doctors: {
      list: `${API_BASE}/reception/doctors`,
    },
    beds: {
      list: `${API_BASE}/reception/beds`,
      available: `${API_BASE}/reception/beds/available`,
      occupy: (id: string) => `${API_BASE}/reception/beds/${id}/occupy`,
      free: (id: string) => `${API_BASE}/reception/beds/${id}/free`,
    },
    stats: `${API_BASE}/reception/stats`,
  },

  // Médecin
  doctor: {
    dossiers: {
      list: `${API_BASE}/doctor/dossiers`,
      get: (id: string) => `${API_BASE}/doctor/dossiers/${id}`,
    },
    consultations: {
      create: `${API_BASE}/doctor/consultations`,
      complete: (id: string) => `${API_BASE}/doctor/consultations/${id}/complete`,
    },
    prescriptions: {
      list: `${API_BASE}/doctor/prescriptions`,
      create: `${API_BASE}/doctor/prescriptions`,
      send: (id: string) => `${API_BASE}/doctor/prescriptions/${id}/send`,
    },
    customItems: {
      list: `${API_BASE}/doctor/custom-items`,
      create: `${API_BASE}/doctor/custom-items`,
    },
    results: {
      list: `${API_BASE}/doctor/results`,
      get: (id: string) => `${API_BASE}/doctor/results/${id}`,
    },
  },

  // Statistiques
  stats: {
    overview: `${API_BASE}/stats/overview`,
    patients: `${API_BASE}/stats/patients`,
    consultations: `${API_BASE}/stats/consultations`,
    revenue: `${API_BASE}/stats/revenue`,
    lab: `${API_BASE}/stats/lab`,
    imaging: `${API_BASE}/stats/imaging`,
    pharmacy: `${API_BASE}/stats/pharmacy`,
    users: `${API_BASE}/stats/users`,
    beds: `${API_BASE}/stats/beds`,
    reports: {
      daily: `${API_BASE}/stats/reports/daily`,
      monthly: `${API_BASE}/stats/reports/monthly`,
    },
  },

  // Dashboard
  dashboard: {
    stats: `${API_BASE}/dashboard/stats`,
  },

  // PDF
  pdf: {
    generate: `${API_BASE}/pdf/generate`,
  },
} as const;

export default API_ROUTES;
