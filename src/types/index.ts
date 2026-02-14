// VITALIS Clinic Management System Types

// User Roles
export type UserRole = 'admin' | 'reception' | 'doctor' | 'lab' | 'pharmacy';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  mustChangePassword?: boolean; // Indique si l'utilisateur doit changer son mot de passe
}

// Patient Types
export interface Patient {
  id: string;
  vitalisId: string; // VTL-YYYY-XXXXX
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export type PaymentMethod = 'orange_money' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentType = 'consultation' | 'lab' | 'pharmacy' | 'imaging';

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  type: PaymentType;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

// Consultation Types
export type ConsultationStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  status: ConsultationStatus;
  symptoms?: string;
  vitals?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    weight?: number;
    height?: number;
  };
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Lab Request Types
export type LabRequestStatus = 
  | 'pending' 
  | 'sent_to_doctor';

export interface LabExam {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface ImagingExam {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface LabRequest {
  id: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
  labTechnicianId?: string;
  exams: LabExam[];
  status: LabRequestStatus;
  totalAmount: number;
  paymentId?: string;
  results?: LabResult[];
  createdAt: string;
  updatedAt: string;
}

export type ImagingRequestStatus = 
  | 'pending' 
  | 'sent_to_doctor';

export interface ImagingRequest {
  id: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
  labTechnicianId?: string;
  exams: ImagingExam[];
  status: ImagingRequestStatus;
  totalAmount: number;
  paymentId?: string;
  results?: string; // URL ou description des résultats d'imagerie
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  examId: string;
  examName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  notes?: string;
  completedAt: string;
}

// Detailed Lab Results Types
export type ResultAlert = 'low' | 'normal' | 'high';

export interface LabResultParameter {
  id: string;
  parameterName: string;
  value: string;
  unit: string;
  referenceRange: string;
  alert?: ResultAlert;
  notes?: string;
}

export interface LabResultSection {
  id: string;
  sectionName: string;
  parameters: LabResultParameter[];
}

export interface DetailedLabResult {
  id: string;
  labRequestId: string;
  examId: string;
  examName: string;
  sections: LabResultSection[];
  status: 'draft' | 'validated' | 'sent';
  validatedBy?: string;
  validatedAt?: string;
  sentAt?: string;
  technicianNotes?: string;
  completedAt: string;
}

// Prescription Types
export type PrescriptionStatus = 'created' | 'sent_to_pharmacy' | 'preparing' | 'ready' | 'delivered';

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
  items: PrescriptionItem[];
  status: PrescriptionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pharmacy Types
export interface PharmacyProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  expiryDate?: string;
}

export type StockAlertType = 'low_stock' | 'out_of_stock' | 'expiring_soon';

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  type: StockAlertType;
  currentStock: number;
  minStock: number;
  createdAt: string;
}

// Bed Types
export type BedType = 'classic' | 'vip';

export interface Bed {
  id: string;
  number: string;
  type: BedType;
  additionalFee: number;
  isOccupied: boolean;
  patientId?: string;
}

// Assignment Types
export interface DoctorAssignment {
  id: string;
  patientId: string;
  doctorId: string;
  paymentId: string;
  status: 'assigned' | 'in_consultation' | 'completed';
  createdAt: string;
  createdBy: string;
}

// Consultation Dossier Types
export type DossierStatus = 'active' | 'completed' | 'archived';

export interface CustomItem {
  id: string;
  consultationId?: string;
  patientId: string;
  doctorId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  items: PrescriptionItem[];
  status: 'draft' | 'sent' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationDossier {
  id: string;
  patientId: string;
  doctorId: string;
  assignmentId: string; // Lien avec l'assignation
  status: DossierStatus;
  consultationId?: string; // ID de la consultation si créée
  labRequestIds?: string[]; // IDs des demandes labo liées
  prescriptionIds?: string[]; // IDs des ordonnances liées
  prescriptions?: Prescription[]; // Ordonnances complètes (incluant les items)
  customItems?: CustomItem[]; // Items personnalisés (onglet "Autre")
  createdAt: string;
  completedAt?: string; // Date de fin de consultation
  archivedAt?: string; // Date d'archivage
  archivedBy?: string; // ID de l'utilisateur qui a archivé
}

// Patient Journey / Timeline
export type TimelineEventType = 
  | 'registration'
  | 'payment_consultation'
  | 'doctor_assignment'
  | 'consultation_start'
  | 'consultation_end'
  | 'lab_request'
  | 'lab_payment'
  | 'lab_assigned'
  | 'lab_results'
  | 'prescription_created'
  | 'prescription_sent'
  | 'pharmacy_prepared'
  | 'pharmacy_delivered';

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: number | string;
  children?: NavItem[];
}

// Stats
export interface DashboardStats {
  patientsToday: number;
  consultationsToday: number;
  pendingLabRequests: number;
  pendingPrescriptions: number;
  revenue: number;
  occupancyRate: number;
}
