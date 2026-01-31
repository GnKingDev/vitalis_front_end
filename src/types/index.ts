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
export type PaymentType = 'consultation' | 'lab' | 'pharmacy';

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
  | 'requested' 
  | 'pending_payment' 
  | 'paid' 
  | 'assigned' 
  | 'in_progress' 
  | 'result_ready' 
  | 'sent_to_doctor';

export interface LabExam {
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

export interface LabResult {
  examId: string;
  examName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  notes?: string;
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
