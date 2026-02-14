import type {
  User,
  Patient,
  Payment,
  Consultation,
  LabRequest,
  LabExam,
  ImagingExam,
  ImagingRequest,
  Prescription,
  PharmacyProduct,
  StockAlert,
  DoctorAssignment,
  TimelineEvent,
  ConsultationDossier,
  Bed,
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Dr. Amadou Diallo',
    email: 'amadou.diallo@vitalis.com',
    role: 'admin',
    department: 'Administration',
  },
  {
    id: 'user-2',
    name: 'Fatou Koné',
    email: 'fatou.kone@vitalis.com',
    role: 'reception',
    department: 'Accueil',
  },
  {
    id: 'user-3',
    name: 'Dr. Ibrahim Traoré',
    email: 'ibrahim.traore@vitalis.com',
    role: 'doctor',
    department: 'Médecine Générale',
  },
  {
    id: 'user-4',
    name: 'Dr. Mariam Ouattara',
    email: 'mariam.ouattara@vitalis.com',
    role: 'doctor',
    department: 'Cardiologie',
  },
  {
    id: 'user-5',
    name: 'Seydou Bamba',
    email: 'seydou.bamba@vitalis.com',
    role: 'lab',
    department: 'Laboratoire',
  },
  {
    id: 'user-6',
    name: 'Aminata Coulibaly',
    email: 'aminata.coulibaly@vitalis.com',
    role: 'pharmacy',
    department: 'Pharmacie',
  },
];

// Generate Vitalis ID
export const generateVitalisId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `VTL-${year}-${random}`;
};

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    vitalisId: 'VTL-2026-00001',
    firstName: 'Moussa',
    lastName: 'Diarra',
    dateOfBirth: '1985-03-15',
    gender: 'M',
    phone: '+225 07 12 34 56 78',
    email: 'moussa.diarra@email.com',
    address: 'Cocody, Abidjan',
    bloodType: 'O+',
    allergies: ['Pénicilline'],
    createdAt: '2026-01-28T08:30:00Z',
    updatedAt: '2026-01-28T08:30:00Z',
  },
  {
    id: 'patient-2',
    vitalisId: 'VTL-2026-00002',
    firstName: 'Awa',
    lastName: 'Touré',
    dateOfBirth: '1990-07-22',
    gender: 'F',
    phone: '+225 05 98 76 54 32',
    address: 'Plateau, Abidjan',
    bloodType: 'A+',
    createdAt: '2026-01-28T09:15:00Z',
    updatedAt: '2026-01-28T09:15:00Z',
  },
  {
    id: 'patient-3',
    vitalisId: 'VTL-2026-00003',
    firstName: 'Kouadio',
    lastName: 'Yao',
    dateOfBirth: '1978-11-08',
    gender: 'M',
    phone: '+225 07 45 67 89 01',
    address: 'Marcory, Abidjan',
    bloodType: 'B-',
    allergies: ['Aspirine', 'Sulfamides'],
    createdAt: '2026-01-29T10:00:00Z',
    updatedAt: '2026-01-29T10:00:00Z',
  },
  {
    id: 'patient-4',
    vitalisId: 'VTL-2026-00004',
    firstName: 'Salimata',
    lastName: 'Konaté',
    dateOfBirth: '1995-02-14',
    gender: 'F',
    phone: '+225 05 23 45 67 89',
    address: 'Yopougon, Abidjan',
    createdAt: '2026-01-30T07:45:00Z',
    updatedAt: '2026-01-30T07:45:00Z',
  },
  {
    id: 'patient-5',
    vitalisId: 'VTL-2026-00005',
    firstName: 'Bakary',
    lastName: 'Sanogo',
    dateOfBirth: '1968-09-30',
    gender: 'M',
    phone: '+225 07 89 01 23 45',
    address: 'Treichville, Abidjan',
    bloodType: 'AB+',
    createdAt: '2026-01-31T08:00:00Z',
    updatedAt: '2026-01-31T08:00:00Z',
  },
  {
    id: 'patient-6',
    vitalisId: 'VTL-2026-00006',
    firstName: 'Fatou',
    lastName: 'Cissé',
    dateOfBirth: '1992-05-18',
    gender: 'F',
    phone: '+225 05 11 22 33 44',
    email: 'fatou.cisse@email.com',
    address: 'Adjamé, Abidjan',
    bloodType: 'O+',
    createdAt: '2026-01-28T10:30:00Z',
    updatedAt: '2026-01-28T10:30:00Z',
  },
  {
    id: 'patient-7',
    vitalisId: 'VTL-2026-00007',
    firstName: 'Ibrahim',
    lastName: 'Kouamé',
    dateOfBirth: '1988-12-03',
    gender: 'M',
    phone: '+225 07 22 33 44 55',
    address: 'Abobo, Abidjan',
    bloodType: 'A-',
    allergies: ['Iode'],
    createdAt: '2026-01-28T11:15:00Z',
    updatedAt: '2026-01-28T11:15:00Z',
  },
  {
    id: 'patient-8',
    vitalisId: 'VTL-2026-00008',
    firstName: 'Aminata',
    lastName: 'Sangaré',
    dateOfBirth: '1997-08-25',
    gender: 'F',
    phone: '+225 05 33 44 55 66',
    email: 'aminata.sangare@email.com',
    address: 'Yopougon, Abidjan',
    bloodType: 'B+',
    createdAt: '2026-01-28T14:20:00Z',
    updatedAt: '2026-01-28T14:20:00Z',
  },
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'pay-1',
    patientId: 'patient-1',
    amount: 15000,
    method: 'orange_money',
    status: 'paid',
    type: 'consultation',
    reference: 'OM-20260128-001',
    createdAt: '2026-01-28T08:35:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-2',
    patientId: 'patient-2',
    amount: 15000,
    method: 'cash',
    status: 'paid',
    type: 'consultation',
    createdAt: '2026-01-28T09:20:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-3',
    patientId: 'patient-3',
    amount: 35000,
    method: 'orange_money',
    status: 'paid',
    type: 'lab',
    reference: 'OM-20260129-002',
    createdAt: '2026-01-29T11:00:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-4',
    patientId: 'patient-4',
    amount: 15000,
    method: 'cash',
    status: 'pending',
    type: 'consultation',
    createdAt: '2026-01-30T07:50:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-5',
    patientId: 'patient-5',
    amount: 15000,
    method: 'cash',
    status: 'paid',
    type: 'consultation',
    createdAt: '2026-01-31T08:05:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-6',
    patientId: 'patient-6',
    amount: 15000,
    method: 'orange_money',
    status: 'paid',
    type: 'consultation',
    reference: 'OM-20260128-003',
    createdAt: '2026-01-28T10:35:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-7',
    patientId: 'patient-1',
    amount: 40000,
    method: 'cash',
    status: 'paid',
    type: 'imaging',
    createdAt: '2026-01-28T10:35:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-8',
    patientId: 'patient-2',
    amount: 25000,
    method: 'orange_money',
    status: 'paid',
    type: 'imaging',
    reference: 'OM-20260128-004',
    createdAt: '2026-01-28T11:05:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-9',
    patientId: 'patient-3',
    amount: 80000,
    method: 'cash',
    status: 'paid',
    type: 'imaging',
    createdAt: '2026-01-27T14:05:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-10',
    patientId: 'patient-1',
    amount: 65000,
    method: 'orange_money',
    status: 'paid',
    type: 'imaging',
    reference: 'OM-20260129-001',
    createdAt: '2026-01-29T09:05:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'pay-11',
    patientId: 'patient-3',
    amount: 32000,
    method: 'cash',
    status: 'pending',
    type: 'pharmacy',
    createdAt: '2026-01-29T09:00:00Z',
    createdBy: 'user-6',
  },
  {
    id: 'pay-12',
    patientId: 'patient-4',
    amount: 15000,
    method: 'orange_money',
    status: 'paid',
    type: 'pharmacy',
    reference: 'OM-20260129-006',
    createdAt: '2026-01-29T10:20:00Z',
    createdBy: 'user-6',
  },
];

// Mock Consultations
export const mockConsultations: Consultation[] = [
  {
    id: 'consult-1',
    patientId: 'patient-1',
    doctorId: 'user-3',
    status: 'completed',
    symptoms: 'Fièvre, maux de tête, fatigue générale',
    vitals: {
      temperature: 38.5,
      bloodPressure: '130/85',
      heartRate: 88,
      weight: 72,
    },
    diagnosis: 'Paludisme probable - examens labo demandés',
    notes: 'Patient présente les symptômes classiques du paludisme. TDR et NFS demandés.',
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-01-28T09:45:00Z',
  },
  {
    id: 'consult-2',
    patientId: 'patient-2',
    doctorId: 'user-4',
    status: 'completed',
    symptoms: 'Douleurs thoraciques, essoufflement',
    vitals: {
      temperature: 37.2,
      bloodPressure: '145/95',
      heartRate: 92,
      weight: 65,
    },
    diagnosis: 'Hypertension artérielle - suivi cardiologique recommandé',
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-01-28T10:30:00Z',
  },
  {
    id: 'consult-3',
    patientId: 'patient-3',
    doctorId: 'user-3',
    status: 'in_progress',
    symptoms: 'Toux persistante, douleurs musculaires',
    vitals: {
      temperature: 37.8,
      bloodPressure: '120/80',
      heartRate: 75,
    },
    createdAt: '2026-01-29T10:30:00Z',
    updatedAt: '2026-01-29T10:30:00Z',
  },
  {
    id: 'consult-4',
    patientId: 'patient-5',
    doctorId: 'user-3',
    status: 'waiting',
    createdAt: '2026-01-31T08:10:00Z',
    updatedAt: '2026-01-31T08:10:00Z',
  },
];

// Mock Lab Exams Catalog
export const labExamsCatalog: LabExam[] = [
  { id: 'exam-1', name: 'Test de Diagnostic Rapide (TDR) Paludisme', category: 'Parasitologie', price: 5000 },
  { id: 'exam-2', name: 'Numération Formule Sanguine (NFS)', category: 'Hématologie', price: 8000 },
  { id: 'exam-3', name: 'Glycémie à jeun', category: 'Biochimie', price: 3000 },
  { id: 'exam-4', name: 'Créatinine', category: 'Biochimie', price: 4000 },
  { id: 'exam-5', name: 'Transaminases (ASAT/ALAT)', category: 'Biochimie', price: 6000 },
  { id: 'exam-6', name: 'Groupe sanguin + Rhésus', category: 'Immunohématologie', price: 5000 },
  { id: 'exam-7', name: 'Sérologie VIH', category: 'Sérologie', price: 7000 },
  { id: 'exam-8', name: 'ECBU (Examen cytobactériologique des urines)', category: 'Bactériologie', price: 10000 },
  { id: 'exam-9', name: 'Hépatite B (AgHBs)', category: 'Sérologie', price: 8000 },
  { id: 'exam-10', name: 'Cholestérol total', category: 'Biochimie', price: 4000 },
];

// Mock Imaging Exams Catalog
export const imagingExamsCatalog: ImagingExam[] = [
  { id: 'img-1', name: 'Radiographie thorax (face)', category: 'Radiologie', price: 15000 },
  { id: 'img-2', name: 'Radiographie thorax (profil)', category: 'Radiologie', price: 15000 },
  { id: 'img-3', name: 'Radiographie abdomen sans préparation (ASP)', category: 'Radiologie', price: 12000 },
  { id: 'img-4', name: 'Radiographie bassin', category: 'Radiologie', price: 12000 },
  { id: 'img-5', name: 'Radiographie crâne', category: 'Radiologie', price: 15000 },
  { id: 'img-6', name: 'Radiographie membres supérieurs', category: 'Radiologie', price: 10000 },
  { id: 'img-7', name: 'Radiographie membres inférieurs', category: 'Radiologie', price: 10000 },
  { id: 'img-8', name: 'Échographie abdominale', category: 'Échographie', price: 25000 },
  { id: 'img-9', name: 'Échographie pelvienne', category: 'Échographie', price: 25000 },
  { id: 'img-10', name: 'Échographie obstétricale', category: 'Échographie', price: 30000 },
  { id: 'img-11', name: 'Échographie cardiaque (échocardiographie)', category: 'Échographie', price: 35000 },
  { id: 'img-12', name: 'Échographie doppler', category: 'Échographie', price: 30000 },
  { id: 'img-13', name: 'Scanner cérébral', category: 'Scanner', price: 80000 },
  { id: 'img-14', name: 'Scanner thorax', category: 'Scanner', price: 70000 },
  { id: 'img-15', name: 'Scanner abdomen', category: 'Scanner', price: 75000 },
  { id: 'img-16', name: 'IRM cérébrale', category: 'IRM', price: 120000 },
  { id: 'img-17', name: 'IRM rachis', category: 'IRM', price: 100000 },
];

// Mock Lab Requests
export const mockLabRequests: LabRequest[] = [
  {
    id: 'lab-1',
    patientId: 'patient-1',
    consultationId: 'consult-1',
    doctorId: 'user-3',
    labTechnicianId: 'user-5',
    exams: [labExamsCatalog[0], labExamsCatalog[1]],
    status: 'sent_to_doctor',
    totalAmount: 13000,
    paymentId: 'pay-6',
    results: [
      {
        examId: 'exam-1',
        examName: 'TDR Paludisme',
        value: 'Positif',
        unit: '',
        referenceRange: 'Négatif',
        notes: 'Présence de Plasmodium falciparum détectée. Test rapide positif confirmé.',
        completedAt: '2026-01-28T14:00:00Z',
      },
      {
        examId: 'exam-2',
        examName: 'Numération Formule Sanguine (NFS)',
        value: 'Hémoglobine: 11.2 g/dL\nGlobules blancs: 8500/mm³\nPlaquettes: 180000/mm³\nHématocrite: 34%\nVGM: 88 fL',
        unit: '',
        referenceRange: 'Hb: 12-16 g/dL\nGB: 4000-10000/mm³\nPlaq: 150000-400000/mm³\nHt: 36-48%\nVGM: 80-100 fL',
        notes: 'Anémie légère (Hb abaissée). Leucocytose modérée. Thrombopénie légère. VGM normal.',
        completedAt: '2026-01-28T14:30:00Z',
      },
    ],
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-01-28T15:00:00Z',
  },
  {
    id: 'lab-2',
    patientId: 'patient-3',
    consultationId: 'consult-3',
    doctorId: 'user-3',
    exams: [labExamsCatalog[2], labExamsCatalog[4]],
    status: 'pending',
    totalAmount: 9000,
    paymentId: 'pay-3',
    createdAt: '2026-01-29T11:30:00Z',
    updatedAt: '2026-01-29T12:00:00Z',
  },
  {
    id: 'lab-4',
    patientId: 'patient-2',
    consultationId: 'consult-2',
    doctorId: 'user-4',
    labTechnicianId: 'user-5',
    exams: [labExamsCatalog[2], labExamsCatalog[3], labExamsCatalog[5]],
    status: 'sent_to_doctor',
    totalAmount: 15000,
    paymentId: 'pay-2',
    results: [
      {
        examId: 'exam-3',
        examName: 'Glycémie à jeun',
        value: '5.8',
        unit: 'mmol/L',
        referenceRange: '3.9 - 5.5 mmol/L',
        notes: 'Glycémie légèrement élevée. Recommandation: contrôle diététique et réévaluation.',
        completedAt: '2026-01-28T15:00:00Z',
      },
      {
        examId: 'exam-4',
        examName: 'Créatinine',
        value: '95',
        unit: 'μmol/L',
        referenceRange: '62 - 106 μmol/L (Femme)',
        notes: 'Valeur dans les limites normales.',
        completedAt: '2026-01-28T15:15:00Z',
      },
      {
        examId: 'exam-5',
        examName: 'Transaminases (ALAT/ASAT)',
        value: 'ALAT: 42 U/L\nASAT: 38 U/L',
        unit: 'U/L',
        referenceRange: 'ALAT: 7-35 U/L\nASAT: 10-40 U/L',
        notes: 'ALAT légèrement élevée. ASAT normale. Évaluation hépatique à surveiller.',
        completedAt: '2026-01-28T15:30:00Z',
      },
    ],
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-01-28T15:30:00Z',
  },
  {
    id: 'lab-3',
    patientId: 'patient-2',
    consultationId: 'consult-2',
    doctorId: 'user-4',
    exams: [labExamsCatalog[9]],
    status: 'pending',
    totalAmount: 4000,
    createdAt: '2026-01-28T11:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
  },
];

// Mock Imaging Requests
export const mockImagingRequests: ImagingRequest[] = [
  {
    id: 'img-1',
    patientId: 'patient-1',
    consultationId: 'consult-1',
    doctorId: 'user-3',
    exams: [imagingExamsCatalog[0], imagingExamsCatalog[7]],
    status: 'pending',
    totalAmount: 40000,
    paymentId: 'pay-7',
    createdAt: '2026-01-28T10:30:00Z',
    updatedAt: '2026-01-28T10:30:00Z',
  },
  {
    id: 'img-2',
    patientId: 'patient-2',
    consultationId: 'consult-2',
    doctorId: 'user-4',
    exams: [imagingExamsCatalog[8]],
    status: 'pending',
    totalAmount: 25000,
    paymentId: 'pay-8',
    createdAt: '2026-01-28T11:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
  },
  {
    id: 'img-3',
    patientId: 'patient-3',
    consultationId: 'consult-3',
    doctorId: 'user-3',
    exams: [imagingExamsCatalog[12]],
    status: 'sent_to_doctor',
    totalAmount: 80000,
    paymentId: 'pay-9',
    results: 'Scanner cérébral réalisé. Pas de lésion intracrânienne visible. Structures normales.',
    createdAt: '2026-01-27T14:00:00Z',
    updatedAt: '2026-01-27T16:00:00Z',
  },
  {
    id: 'img-4',
    patientId: 'patient-1',
    consultationId: 'consult-1',
    doctorId: 'user-3',
    exams: [imagingExamsCatalog[9], imagingExamsCatalog[10]],
    status: 'pending',
    totalAmount: 65000,
    paymentId: 'pay-10',
    createdAt: '2026-01-29T09:00:00Z',
    updatedAt: '2026-01-29T09:00:00Z',
  },
];

// Mock Prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: 'rx-1',
    patientId: 'patient-1',
    consultationId: 'consult-1',
    doctorId: 'user-3',
    items: [
      {
        id: 'item-1',
        medicationName: 'Artéméther-Luméfantrine (Coartem)',
        dosage: '80/480mg',
        frequency: '2 fois par jour',
        duration: '3 jours',
        instructions: 'Prendre avec un repas riche en graisses',
        quantity: 12,
      },
      {
        id: 'item-2',
        medicationName: 'Paracétamol 500mg',
        dosage: '500mg',
        frequency: '3 fois par jour',
        duration: '5 jours',
        instructions: 'En cas de fièvre ou douleur',
        quantity: 15,
      },
    ],
    status: 'sent_to_pharmacy',
    notes: 'Bien hydrater le patient. Contrôle dans 7 jours.',
    createdAt: '2026-01-28T15:00:00Z',
    updatedAt: '2026-01-28T15:00:00Z',
  },
  {
    id: 'rx-2',
    patientId: 'patient-2',
    consultationId: 'consult-2',
    doctorId: 'user-4',
    items: [
      {
        id: 'item-3',
        medicationName: 'Amlodipine 5mg',
        dosage: '5mg',
        frequency: '1 fois par jour',
        duration: '30 jours',
        instructions: 'Prendre le matin',
        quantity: 30,
      },
      {
        id: 'item-4',
        medicationName: 'Hydrochlorothiazide 25mg',
        dosage: '25mg',
        frequency: '1 fois par jour',
        duration: '30 jours',
        instructions: 'Prendre le matin',
        quantity: 30,
      },
    ],
    status: 'ready',
    createdAt: '2026-01-28T11:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
  },
];

// Mock Pharmacy Products
export const mockPharmacyProducts: PharmacyProduct[] = [
  { id: 'prod-1', name: 'Paracétamol 500mg', category: 'Antalgiques', price: 1500, stock: 250, minStock: 50, unit: 'boîte' },
  { id: 'prod-2', name: 'Amoxicilline 500mg', category: 'Antibiotiques', price: 3500, stock: 80, minStock: 30, unit: 'boîte' },
  { id: 'prod-3', name: 'Coartem 80/480mg', category: 'Antipaludéens', price: 4500, stock: 45, minStock: 20, unit: 'boîte' },
  { id: 'prod-4', name: 'Amlodipine 5mg', category: 'Antihypertenseurs', price: 2800, stock: 60, minStock: 25, unit: 'boîte' },
  { id: 'prod-5', name: 'Oméprazole 20mg', category: 'Gastro-entérologie', price: 2200, stock: 15, minStock: 30, unit: 'boîte' },
  { id: 'prod-6', name: 'Ibuprofène 400mg', category: 'Anti-inflammatoires', price: 1800, stock: 120, minStock: 40, unit: 'boîte' },
  { id: 'prod-7', name: 'Métformine 500mg', category: 'Antidiabétiques', price: 2500, stock: 8, minStock: 20, unit: 'boîte' },
  { id: 'prod-8', name: 'Sérum physiologique 0.9%', category: 'Solutés', price: 800, stock: 200, minStock: 50, unit: 'flacon' },
  { id: 'prod-9', name: 'Vitamine C 500mg', category: 'Vitamines', price: 1200, stock: 95, minStock: 30, unit: 'boîte' },
  { id: 'prod-10', name: 'Cotrimoxazole 480mg', category: 'Antibiotiques', price: 1800, stock: 0, minStock: 25, unit: 'boîte' },
];

// Mock Stock Alerts
export const mockStockAlerts: StockAlert[] = [
  {
    id: 'alert-1',
    productId: 'prod-5',
    productName: 'Oméprazole 20mg',
    type: 'low_stock',
    currentStock: 15,
    minStock: 30,
    createdAt: '2026-01-31T06:00:00Z',
  },
  {
    id: 'alert-2',
    productId: 'prod-7',
    productName: 'Métformine 500mg',
    type: 'low_stock',
    currentStock: 8,
    minStock: 20,
    createdAt: '2026-01-31T06:00:00Z',
  },
  {
    id: 'alert-3',
    productId: 'prod-10',
    productName: 'Cotrimoxazole 480mg',
    type: 'out_of_stock',
    currentStock: 0,
    minStock: 25,
    createdAt: '2026-01-31T06:00:00Z',
  },
];

// Mock Doctor Assignments
export const mockDoctorAssignments: DoctorAssignment[] = [
  {
    id: 'assign-1',
    patientId: 'patient-1',
    doctorId: 'user-3',
    paymentId: 'pay-1',
    status: 'completed',
    createdAt: '2026-01-28T08:40:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'assign-2',
    patientId: 'patient-2',
    doctorId: 'user-4',
    paymentId: 'pay-2',
    status: 'completed',
    createdAt: '2026-01-28T09:25:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'assign-3',
    patientId: 'patient-3',
    doctorId: 'user-3',
    paymentId: 'pay-7',
    status: 'in_consultation',
    createdAt: '2026-01-29T10:15:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'assign-4',
    patientId: 'patient-5',
    doctorId: 'user-3',
    paymentId: 'pay-5',
    status: 'assigned',
    createdAt: '2026-01-31T08:10:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'assign-5',
    patientId: 'patient-6',
    doctorId: 'user-4',
    paymentId: 'pay-6',
    status: 'completed',
    createdAt: '2026-01-28T10:40:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'assign-6',
    patientId: 'patient-7',
    doctorId: 'user-3',
    paymentId: 'pay-7',
    status: 'in_consultation',
    createdAt: '2026-01-28T11:25:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'assign-7',
    patientId: 'patient-1',
    doctorId: 'user-3',
    paymentId: 'pay-8',
    status: 'completed',
    createdAt: '2026-02-01T09:00:00Z',
    createdBy: 'user-2',
  },
];

// Mock Consultation Dossiers
export const mockConsultationDossiers: ConsultationDossier[] = [
  {
    id: 'dossier-1',
    patientId: 'patient-1',
    doctorId: 'user-3',
    assignmentId: 'assign-1',
    status: 'archived',
    consultationId: 'consult-1',
    labRequestIds: ['lab-req-1'],
    prescriptionIds: ['presc-1'],
    createdAt: '2026-01-28T08:40:00Z',
    completedAt: '2026-01-28T15:00:00Z',
    archivedAt: '2026-01-28T15:30:00Z',
    archivedBy: 'user-3',
  },
  {
    id: 'dossier-2',
    patientId: 'patient-2',
    doctorId: 'user-4',
    assignmentId: 'assign-2',
    status: 'archived',
    consultationId: 'consult-2',
    createdAt: '2026-01-28T09:25:00Z',
    completedAt: '2026-01-28T10:30:00Z',
    archivedAt: '2026-01-28T10:35:00Z',
    archivedBy: 'user-4',
  },
  {
    id: 'dossier-3',
    patientId: 'patient-3',
    doctorId: 'user-3',
    assignmentId: 'assign-3',
    status: 'active',
    consultationId: 'consult-3',
    createdAt: '2026-01-29T10:15:00Z',
  },
  {
    id: 'dossier-4',
    patientId: 'patient-5',
    doctorId: 'user-3',
    assignmentId: 'assign-4',
    status: 'active',
    createdAt: '2026-01-31T08:10:00Z',
  },
  {
    id: 'dossier-5',
    patientId: 'patient-6',
    doctorId: 'user-4',
    assignmentId: 'assign-5',
    status: 'archived',
    consultationId: 'consult-4',
    createdAt: '2026-01-28T10:40:00Z',
    completedAt: '2026-01-28T11:00:00Z',
    archivedAt: '2026-01-28T11:05:00Z',
    archivedBy: 'user-4',
  },
  {
    id: 'dossier-6',
    patientId: 'patient-7',
    doctorId: 'user-3',
    assignmentId: 'assign-6',
    status: 'completed',
    consultationId: 'consult-4',
    createdAt: '2026-01-28T11:25:00Z',
    completedAt: '2026-01-28T12:00:00Z',
  },
  // Patient 1 - deuxième visite (nouveau dossier)
  {
    id: 'dossier-7',
    patientId: 'patient-1',
    doctorId: 'user-3',
    assignmentId: 'assign-7',
    status: 'archived',
    consultationId: 'consult-5',
    createdAt: '2026-02-01T09:00:00Z',
    completedAt: '2026-02-01T10:00:00Z',
    archivedAt: '2026-02-01T10:15:00Z',
    archivedBy: 'user-3',
  },
];

// Mock Timeline Events
export const mockTimelineEvents: TimelineEvent[] = [
  // Patient 1 journey
  {
    id: 'event-1',
    patientId: 'patient-1',
    type: 'registration',
    title: 'Enregistrement patient',
    description: 'Patient enregistré - ID: VTL-2026-00001',
    createdAt: '2026-01-28T08:30:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'event-2',
    patientId: 'patient-1',
    type: 'payment_consultation',
    title: 'Paiement consultation',
    description: 'Paiement reçu: 15 000 GNF (Orange Money)',
    createdAt: '2026-01-28T08:35:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'event-3',
    patientId: 'patient-1',
    type: 'doctor_assignment',
    title: 'Assignation médecin',
    description: 'Assigné à Dr. Ibrahim Traoré',
    createdAt: '2026-01-28T08:40:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'event-4',
    patientId: 'patient-1',
    type: 'consultation_start',
    title: 'Début consultation',
    description: 'Consultation démarrée',
    createdAt: '2026-01-28T09:00:00Z',
    createdBy: 'user-3',
  },
  {
    id: 'event-5',
    patientId: 'patient-1',
    type: 'lab_request',
    title: 'Demande examens labo',
    description: 'TDR Paludisme, NFS demandés',
    createdAt: '2026-01-28T09:30:00Z',
    createdBy: 'user-3',
  },
  {
    id: 'event-6',
    patientId: 'patient-1',
    type: 'lab_payment',
    title: 'Paiement examens labo',
    description: 'Paiement reçu: 13 000 GNF',
    createdAt: '2026-01-28T10:00:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'event-7',
    patientId: 'patient-1',
    type: 'lab_results',
    title: 'Résultats labo prêts',
    description: 'Résultats disponibles pour le médecin',
    createdAt: '2026-01-28T14:30:00Z',
    createdBy: 'user-5',
  },
  {
    id: 'event-8',
    patientId: 'patient-1',
    type: 'prescription_created',
    title: 'Ordonnance créée',
    description: 'Traitement antipaludéen prescrit',
    createdAt: '2026-01-28T15:00:00Z',
    createdBy: 'user-3',
  },
  {
    id: 'event-9',
    patientId: 'patient-1',
    type: 'prescription_sent',
    title: 'Ordonnance envoyée',
    description: 'Envoyée à la pharmacie VITALIS',
    createdAt: '2026-01-28T15:05:00Z',
    createdBy: 'user-3',
  },
];

// Dashboard stats generator
export const getDashboardStats = () => ({
  patientsToday: 12,
  consultationsToday: 8,
  pendingLabRequests: 3,
  pendingPrescriptions: 2,
  revenue: 245000,
  occupancyRate: 75,
});

// Get patients assigned to a specific doctor (only active dossiers)
export const getPatientsByDoctor = (doctorId: string) => {
  // Récupérer uniquement les dossiers actifs pour ce médecin
  const activeDossiers = mockConsultationDossiers.filter(
    (d) => d.doctorId === doctorId && d.status === 'active'
  );
  
  return activeDossiers.map((dossier) => {
    const assignment = mockDoctorAssignments.find((a) => a.id === dossier.assignmentId);
    const patient = mockPatients.find((p) => p.id === dossier.patientId);
    const consultation = dossier.consultationId
      ? mockConsultations.find((c) => c.id === dossier.consultationId)
      : undefined;
    return { dossier, assignment, patient, consultation };
  });
};

// Get all dossiers for a patient (history)
export const getPatientDossiers = (patientId: string): ConsultationDossier[] => {
  return mockConsultationDossiers
    .filter((d) => d.patientId === patientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get dossier by ID
export const getDossierById = (dossierId: string): ConsultationDossier | undefined => {
  return mockConsultationDossiers.find((d) => d.id === dossierId);
};

// Get timeline for a patient
export const getPatientTimeline = (patientId: string) => {
  return mockTimelineEvents
    .filter((e) => e.patientId === patientId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

// Mock Beds
export const mockBeds: Bed[] = [
  // Classic beds (gratuits)
  { id: 'bed-1', number: '101', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-2', number: '102', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-3', number: '103', type: 'classic', additionalFee: 0, isOccupied: true, patientId: 'patient-1' },
  { id: 'bed-4', number: '104', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-5', number: '105', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-6', number: '201', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-7', number: '202', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-8', number: '203', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-9', number: '204', type: 'classic', additionalFee: 0, isOccupied: false },
  { id: 'bed-10', number: '205', type: 'classic', additionalFee: 0, isOccupied: false },
  // VIP beds
  { id: 'bed-11', number: '301', type: 'vip', additionalFee: 15000, isOccupied: false },
  { id: 'bed-12', number: '302', type: 'vip', additionalFee: 15000, isOccupied: false },
  { id: 'bed-13', number: '303', type: 'vip', additionalFee: 15000, isOccupied: false },
  { id: 'bed-14', number: '304', type: 'vip', additionalFee: 15000, isOccupied: false },
  { id: 'bed-15', number: '305', type: 'vip', additionalFee: 15000, isOccupied: false },
];

// Get available beds
export const getAvailableBeds = (type?: 'classic' | 'vip'): Bed[] => {
  if (type) {
    return mockBeds.filter((bed) => !bed.isOccupied && bed.type === type);
  }
  return mockBeds.filter((bed) => !bed.isOccupied);
};

// Get bed by ID
export const getBedById = (bedId: string): Bed | undefined => {
  return mockBeds.find((bed) => bed.id === bedId);
};

// Mark bed as occupied
export const occupyBed = (bedId: string, patientId: string): void => {
  const bed = mockBeds.find((b) => b.id === bedId);
  if (bed) {
    bed.isOccupied = true;
    bed.patientId = patientId;
  }
};
